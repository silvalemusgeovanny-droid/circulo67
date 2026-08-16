const https = require("https");

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
            const errorMessage =
              parsed.message ||
              parsed.error?.message ||
              parsed.error ||
              data ||
              `Exa request failed with ${response.statusCode}`;
            reject(new Error(`Exa ${response.statusCode}: ${errorMessage}`));
            return;
          }
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);
    request.write(JSON.stringify(body));
    request.end();
  });
}

async function searchMarketSources(request) {
  if (!process.env.EXA_API_KEY) {
    return [];
  }

  const query =
    `suppliers for ${request.product} ${request.quantity} near ${request.location}, ` +
    `quality certifications, price reference, stock availability, delivery before ${request.deliveryDate}`;

  const response = await requestJson(
    "https://api.exa.ai/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.EXA_API_KEY
      }
    },
    {
      query,
      type: "auto",
      numResults: 5,
      contents: {
        highlights: true
      }
    }
  );

  return (response.results || []).map((result) => ({
    provider: "exa",
    title: result.title || result.url,
    url: result.url,
    publishedDate: result.publishedDate || null,
    highlight: Array.isArray(result.highlights) ? result.highlights.join(" ") : "",
    text: result.text || ""
  }));
}

module.exports = {
  searchMarketSources
};
