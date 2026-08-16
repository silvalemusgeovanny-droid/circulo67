const https = require("https");

const NOTION_VERSION = "2022-06-28";

function requestJson(url, options, body) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (response.statusCode >= 400) {
            const message =
              parsed.message ||
              parsed.error?.message ||
              parsed.error ||
              data ||
              `Notion request failed with ${response.statusCode}`;
            reject(new Error(`Notion ${response.statusCode}: ${message}`));
            return;
          }
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

function textContent(text) {
  return [
    {
      type: "text",
      text: {
        content: String(text || "").slice(0, 2000)
      }
    }
  ];
}

function plainText(items) {
  return (items || []).map((item) => item.plain_text || item.text?.content || "").join("");
}

function readProperty(properties, name) {
  const property = properties?.[name];
  if (!property) return "";

  if (property.type === "title") return plainText(property.title);
  if (property.type === "rich_text") return plainText(property.rich_text);
  if (property.type === "email") return property.email || "";
  if (property.type === "url") return property.url || "";
  if (property.type === "number") return property.number;
  if (property.type === "select") return property.select?.name || "";
  if (property.type === "date") return property.date?.start || "";
  return "";
}

function titleProperty(text) {
  return {
    title: textContent(text)
  };
}

function richTextProperty(text) {
  return {
    rich_text: textContent(text)
  };
}

function numberProperty(value) {
  return {
    number: Number.isFinite(Number(value)) ? Number(value) : null
  };
}

function selectProperty(value) {
  return {
    select: {
      name: String(value || "Pendiente").slice(0, 100)
    }
  };
}

function dateProperty(value) {
  return {
    date: value
      ? {
          start: value
        }
      : null
  };
}

function emailProperty(value) {
  return {
    email: value || null
  };
}

function urlProperty(value) {
  return {
    url: value || null
  };
}

function paragraph(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: textContent(text)
    }
  };
}

function heading(text) {
  return {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: textContent(text)
    }
  };
}

function bulleted(text) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: textContent(text)
    }
  };
}

function buildAnalysisBlocks(analysis) {
  const suppliers = (analysis.suppliers || []).slice(0, 5);
  const discarded = (analysis.discarded || []).slice(0, 6);

  return [
    heading("Recomendación"),
    paragraph(analysis.recommendation),
    heading("Proveedores evaluados"),
    ...suppliers.map((supplier) =>
      bulleted(
        `${supplier.name} | ${supplier.fit || "Sin puntaje"} | ${supplier.priceStatus || "Precio no validado"} | ${supplier.recommendedAction || "Validar antes de avanzar"}`
      )
    ),
    heading("Opciones descartadas"),
    ...discarded.map((item) => bulleted(item)),
    heading("Próximos pasos"),
    ...(analysis.nextSteps || []).map((step) => bulleted(step))
  ];
}

function buildAnalysisProperties(analysis) {
  const mainSupplier = (analysis.suppliers || [])[0];

  return {
    Name: titleProperty(`${analysis.product} - ${analysis.quantity}`),
    Product: richTextProperty(analysis.product),
    Quantity: richTextProperty(analysis.quantity),
    "Delivery Date": dateProperty(analysis.deliveryDate),
    Location: richTextProperty(analysis.location),
    Distance: richTextProperty(analysis.distance),
    Email: emailProperty(analysis.email),
    Risk: selectProperty(analysis.risk),
    Stock: selectProperty(analysis.stock),
    Quality: numberProperty(analysis.quality),
    Price: numberProperty(analysis.price),
    Recommendation: richTextProperty(analysis.recommendation),
    "Top Supplier": richTextProperty(mainSupplier?.name || ""),
    "Source URL": urlProperty(mainSupplier?.sourceUrl || null),
    "Analysis ID": richTextProperty(analysis.id)
  };
}

async function saveAnalysisToNotion(analysis) {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return {
      configured: false,
      saved: false,
      reason: "NOTION_TOKEN and NOTION_DATABASE_ID are required"
    };
  }

  const response = await requestJson(
    "https://api.notion.com/v1/pages",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
      }
    },
    {
      parent: {
        database_id: process.env.NOTION_DATABASE_ID
      },
      properties: buildAnalysisProperties(analysis),
      children: buildAnalysisBlocks(analysis)
    }
  );

  return {
    configured: true,
    saved: true,
    pageId: response.id,
    url: response.url
  };
}

async function getAnalysisHistoryByEmail(email, limit = 10) {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return {
      configured: false,
      items: [],
      reason: "NOTION_TOKEN and NOTION_DATABASE_ID are required"
    };
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Valid email is required");
  }

  const response = await requestJson(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
      }
    },
    {
      page_size: Math.min(Math.max(Number(limit) || 10, 1), 25),
      filter: {
        property: "Email",
        email: {
          equals: normalizedEmail
        }
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending"
        }
      ]
    }
  );

  return {
    configured: true,
    items: (response.results || []).map((page) => ({
      id: page.id,
      url: page.url,
      createdAt: page.created_time,
      name: readProperty(page.properties, "Name"),
      product: readProperty(page.properties, "Product"),
      quantity: readProperty(page.properties, "Quantity"),
      deliveryDate: readProperty(page.properties, "Delivery Date"),
      location: readProperty(page.properties, "Location"),
      email: readProperty(page.properties, "Email"),
      risk: readProperty(page.properties, "Risk"),
      stock: readProperty(page.properties, "Stock"),
      quality: readProperty(page.properties, "Quality"),
      price: readProperty(page.properties, "Price"),
      recommendation: readProperty(page.properties, "Recommendation"),
      topSupplier: readProperty(page.properties, "Top Supplier"),
      sourceUrl: readProperty(page.properties, "Source URL"),
      analysisId: readProperty(page.properties, "Analysis ID")
    }))
  };
}

module.exports = {
  getAnalysisHistoryByEmail,
  saveAnalysisToNotion
};
