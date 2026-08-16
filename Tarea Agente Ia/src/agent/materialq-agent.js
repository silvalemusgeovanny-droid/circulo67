const { searchMarketSources } = require("../integrations/exa");
const { saveAnalysisToNotion } = require("../integrations/notion");
const { sendGmailEmail } = require("../integrations/composio");

const REQUIRED_FIELDS = ["product", "quantity", "deliveryDate", "location", "distance", "email"];

function validateRequest(request) {
  for (const field of REQUIRED_FIELDS) {
    if (!request[field] || String(request[field]).trim().length === 0) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    throw new Error("Invalid recipient email");
  }
}

function scoreFromText(text, base) {
  const total = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.min(96, Math.max(58, base + (total % 19)));
}

function classifyRisk(quality, price, evidenceCount) {
  if (quality >= 84 && price >= 78 && evidenceCount >= 2) return "Bajo";
  if (quality < 68 || price < 64 || evidenceCount === 0) return "Alto";
  return "Controlado";
}

function stockStatus(priceScore, evidenceCount) {
  if (evidenceCount === 0) return "Sin validar";
  if (priceScore >= 82) return "Bueno";
  return "Validar";
}

function clampScore(value) {
  return Math.min(96, Math.max(35, value));
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\.\.\./g, " ")
    .trim();
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return "fuente web";
  }
}

function extractContacts(text, url) {
  const clean = cleanText(text);
  const emails = Array.from(
    new Set((clean.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((email) => email.toLowerCase()))
  );
  const phones = Array.from(
    new Set(
      (clean.match(/(?:\+?52[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g) || [])
        .map((phone) => phone.replace(/\s+/g, " ").trim())
        .filter((phone) => phone.replace(/\D/g, "").length >= 10)
    )
  );

  let website = url || null;
  let socialUrl = null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (/(facebook|instagram|linkedin|x\.com|twitter|youtube)/.test(host)) {
      socialUrl = url;
    }
  } catch (error) {
    website = null;
  }

  const whatsappPhone = phones.find((phone) => phone.replace(/\D/g, "").length >= 10);

  return {
    email: emails[0] || null,
    phone: phones[0] || null,
    whatsapp: whatsappPhone ? `https://wa.me/${whatsappPhone.replace(/\D/g, "")}` : null,
    website,
    socialUrl
  };
}

function findEvidence(text, keywords) {
  const sentences = cleanText(text)
    .split(/(?<=[.!?])\s+|\s+-\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return (
    sentences.find((sentence) =>
      keywords.some((keyword) => sentence.toLowerCase().includes(keyword))
    ) || ""
  );
}

function excerpt(value, maxLength = 190) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function sourceSignals(source, request) {
  const evidenceText = `${source.highlight || ""} ${source.text || ""}`;
  const lower = evidenceText.toLowerCase();
  const locationToken = request.location.split(",")[0].trim().toLowerCase();

  const qualityEvidence = findEvidence(evidenceText, [
    "certificado",
    "certificados",
    "calidad",
    "estándares",
    "estandares",
    "norma",
    "resistentes",
    "duraderos"
  ]);
  const stockEvidence = findEvidence(evidenceText, [
    "disponibilidad",
    "stock",
    "inventario",
    "entrega inmediata",
    "listos para entrega",
    "cotización inmediata",
    "cotizacion inmediata"
  ]);
  const locationEvidence = findEvidence(evidenceText, [
    locationToken,
    "domicilio",
    "envíos",
    "envios",
    "nacional",
    "zona industrial"
  ]);
  const contactEvidence = findEvidence(evidenceText, [
    "cotización",
    "cotizacion",
    "tel",
    "whatsapp",
    "correo",
    "lun - vie",
    "av."
  ]);
  const priceEvidence = findEvidence(evidenceText, [
    "$",
    "precio",
    "precios",
    "cotización",
    "cotizacion",
    "cotizar",
    "cotiza",
    "oferta",
    "mayoreo"
  ]);

  const qualityScore = clampScore(
    45 +
    (qualityEvidence ? 22 : 0) +
    (lower.includes("certific") ? 12 : 0) +
    (lower.includes("calidad") ? 10 : 0) +
    (lower.includes("estándar") || lower.includes("estandar") ? 8 : 0)
  );
  const stockScore = clampScore(
    42 +
    (stockEvidence ? 24 : 0) +
    (lower.includes("disponibilidad inmediata") || lower.includes("entrega inmediata") ? 18 : 0) +
    (lower.includes("stock permanente") || lower.includes("stock amplio") ? 15 : 0)
  );
  const locationScore = clampScore(
    45 +
    (locationEvidence ? 18 : 0) +
    (locationToken && lower.includes(locationToken) ? 18 : 0) +
    (lower.includes("nacional") ? 8 : 0)
  );
  const priceScore = clampScore(
    48 +
    (priceEvidence ? 18 : 0) +
    (lower.includes("cotización inmediata") || lower.includes("cotizacion inmediata") ? 12 : 0) +
    (lower.includes("mayoreo") ? 10 : 0) -
    (!priceEvidence ? 8 : 0)
  );
  const evidenceScore = clampScore(
    40 +
    (qualityEvidence ? 12 : 0) +
    (stockEvidence ? 12 : 0) +
    (locationEvidence ? 10 : 0) +
    (contactEvidence ? 10 : 0) +
    (source.url ? 8 : 0)
  );
  const riskScore = clampScore(
    100 -
    Math.round((qualityScore + stockScore + locationScore + evidenceScore) / 5) -
    (!priceEvidence ? 8 : 0)
  );

  const total = Math.round(
    qualityScore * 0.28 +
    priceScore * 0.22 +
    stockScore * 0.2 +
    locationScore * 0.15 +
    evidenceScore * 0.15 -
    riskScore * 0.08
  );
  const verdict =
    total >= 82
      ? "Candidato fuerte"
      : total >= 68
        ? "Validar con cotización"
        : "Descartar si no confirma datos";
  const priceStatus = priceEvidence
    ? (priceEvidence.includes("$") ? "Precio público detectado" : "Requiere cotización")
    : "Precio no público";
  const action = total >= 82
    ? "Solicitar cotización formal, ficha técnica y confirmación de stock."
    : total >= 68
      ? "Pedir precio por volumen y validar certificaciones antes de avanzar."
      : "No avanzar sin evidencia de calidad, stock y precio final.";
  const contacts = extractContacts(evidenceText, source.url);

  return {
    domain: getDomain(source.url),
    qualityEvidence,
    stockEvidence,
    locationEvidence,
    contactEvidence,
    priceEvidence,
    priceStatus,
    contacts,
    scores: {
      quality: qualityScore,
      price: priceScore,
      stock: stockScore,
      location: locationScore,
      evidence: evidenceScore,
      risk: riskScore,
      total: clampScore(total)
    },
    action,
    score: total,
    verdict
  };
}

function buildSupplierCandidates(request, sources) {
  const product = request.product.trim();
  const location = request.location.trim();
  const distance = request.distance.trim();

  const sourceBacked = sources.slice(0, 5).map((source) => {
    const signals = sourceSignals(source, request);
    return {
      name: source.title || signals.domain,
      fit: `${signals.verdict} (${signals.score}/100)`,
      distance: signals.locationEvidence
        ? excerpt(signals.locationEvidence, 150)
        : `Comparar contra ${location} y límite ${distance}`,
      evidence:
        excerpt(signals.qualityEvidence || signals.stockEvidence || source.highlight, 210) ||
        "Fuente encontrada, falta extraer evidencia",
      stockEvidence: excerpt(signals.stockEvidence, 160) || "Stock no confirmado en la fuente",
      qualityEvidence: excerpt(signals.qualityEvidence, 160) || "Calidad/certificación no confirmada en la fuente",
      contactEvidence: excerpt(signals.contactEvidence, 160) || "Contacto no detectado en el extracto",
      priceEvidence: excerpt(signals.priceEvidence, 160) || "Precio público no detectado",
      priceStatus: signals.priceStatus,
      contacts: signals.contacts,
      recommendedAction: signals.action,
      scores: signals.scores,
      sourceUrl: source.url || null,
      domain: signals.domain,
      score: signals.score,
      verdict: signals.verdict
    };
  });

  if (sourceBacked.length > 0) return sourceBacked;

  return [
    {
      name: `${product} - candidato regional`,
      fit: "Alto: perfil preliminar compatible",
      distance: `Dentro de ${distance}`,
      evidence: "Pendiente de conectar Exa para fuente real",
      priceStatus: "Precio no validado",
      recommendedAction: "Solicitar cotización formal, ficha técnica y confirmación de stock.",
      contacts: {
        email: null,
        phone: null,
        whatsapp: null,
        website: null,
        socialUrl: null
      },
      sourceUrl: null
    },
    {
      name: `${product} - alternativa secundaria`,
      fit: "Medio: precio posible, calidad por confirmar",
      distance: `Cerca de ${location}`,
      evidence: "Requiere ficha técnica y referencias",
      priceStatus: "Requiere cotización",
      recommendedAction: "Pedir precio por volumen y validar certificaciones antes de avanzar.",
      contacts: {
        email: null,
        phone: null,
        whatsapp: null,
        website: null,
        socialUrl: null
      },
      sourceUrl: null
    },
    {
      name: `${product} - descartar si no confirma stock`,
      fit: "Bajo: riesgo por disponibilidad",
      distance: "Variable",
      evidence: "Sin evidencia suficiente",
      priceStatus: "Precio no público",
      recommendedAction: "No avanzar sin evidencia de calidad, stock y precio final.",
      contacts: {
        email: null,
        phone: null,
        whatsapp: null,
        website: null,
        socialUrl: null
      },
      sourceUrl: null
    }
  ];
}

async function analyzePurchase(request) {
  validateRequest(request);

  const normalized = {
    product: request.product.trim(),
    quantity: request.quantity.trim(),
    deliveryDate: request.deliveryDate,
    location: request.location.trim(),
    distance: request.distance.trim(),
    email: request.email.trim(),
    notes: request.notes ? request.notes.trim() : ""
  };

  let sources = [];
  let sourceWarning = null;
  try {
    sources = await searchMarketSources(normalized);
  } catch (error) {
    sourceWarning =
      "Exa no respondió. Revisa la clave EXA_API_KEY y la conexión; mientras tanto MaterialQ muestra candidatos preliminares.";
  }
  const quality = scoreFromText(`${normalized.product}${normalized.location}${normalized.notes}`, 74);
  const price = scoreFromText(`${normalized.quantity}${normalized.distance}${normalized.product}`, 70);
  const risk = classifyRisk(quality, price, sources.length);
  const stock = stockStatus(price, sources.length);
  const suppliers = buildSupplierCandidates(normalized, sources);
  const recommendedSupplier = suppliers.find((supplier) => supplier.score >= 82) || suppliers[0];

  const discarded = [
    ...suppliers
      .filter((supplier) => supplier.score < 68)
      .map((supplier) => `${supplier.name}: ${supplier.qualityEvidence}; ${supplier.stockEvidence}.`),
    "Descartar opciones que no confirmen precio final, ficha técnica y stock por escrito."
  ];

  const analysis = {
    id: `mq_${Date.now()}`,
    createdAt: new Date().toISOString(),
    product: normalized.product,
    quantity: normalized.quantity,
    deliveryDate: normalized.deliveryDate,
    location: normalized.location,
    distance: normalized.distance,
    email: normalized.email,
    notes: normalized.notes,
    quality,
    price,
    risk,
    stock,
    recommendation: recommendedSupplier
      ? `Priorizar ${recommendedSupplier.name}. Motivo: ${recommendedSupplier.fit}. Evidencia clave: ${recommendedSupplier.evidence}. Antes de comprar, solicitar cotización formal para ${normalized.quantity}, ficha técnica y confirmación de entrega antes del ${normalized.deliveryDate}.`
      : `No se encontraron proveedores concretos. Reintenta con una materia prima más específica o una ubicación más amplia.`,
    discarded,
    suppliers,
    sources,
    nextSteps: [
      "Solicitar cotización formal y ficha técnica al candidato principal.",
      "Confirmar stock y fecha de entrega por escrito.",
      "Comparar costo total incluyendo flete, impuestos y condiciones de pago.",
      "Guardar decisión final en Notion y enviar PDF por correo tras confirmación."
    ],
    integrationStatus: {
      exa: sources.some((source) => source.provider === "exa") ? "connected" : "not_configured",
      notion: process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID ? "ready" : "pending",
      composio: process.env.COMPOSIO_API_KEY ? "ready" : "pending"
    },
    warnings: sourceWarning ? [sourceWarning] : []
  };

  try {
    const notion = await saveAnalysisToNotion(analysis);
    analysis.notion = notion;
    if (notion.saved) {
      analysis.integrationStatus.notion = "saved";
    }
  } catch (error) {
    analysis.notion = {
      configured: true,
      saved: false,
      reason: error.message
    };
    analysis.warnings.push(error.message);
  }

  return analysis;
}

function prepareActionPayload(payload) {
  if (!payload || !payload.type || !payload.analysis) {
    throw new Error("Action type and analysis are required");
  }

  const { type, analysis } = payload;
  const base = {
    requiresConfirmation: true,
    analysisId: analysis.id,
    product: analysis.product,
    recipient: analysis.email
  };

  if (type === "email") {
    return {
      ...base,
      type,
      subject: `MaterialQ report: ${analysis.product}`,
      preview: `Reporte de compra para ${analysis.product}. Recomendación: ${analysis.recommendation}`
    };
  }

  if (type === "telegram") {
    return {
      ...base,
      type,
      bot: "@circulo67_bot",
      preview: `MaterialQ tiene listo el análisis de ${analysis.product}. Requiere confirmación antes de enviar detalles.`
    };
  }

  if (type === "pdf") {
    return {
      ...base,
      type,
      filename: `MaterialQ-${analysis.product.replace(/[^a-z0-9]+/gi, "-")}.pdf`,
      preview: "El PDF se genera desde la vista de reporte imprimible en esta beta."
    };
  }

  throw new Error(`Unsupported action type: ${type}`);
}

function buildReportEmail(analysis, supplierIndex = 0) {
  const supplier = (analysis.suppliers || [])[supplierIndex] || (analysis.suppliers || [])[0] || {};
  const contacts = supplier.contacts || {};
  const contactLines = [
    contacts.email ? `Correo proveedor: ${contacts.email}` : "",
    contacts.phone ? `Teléfono proveedor: ${contacts.phone}` : "",
    contacts.whatsapp ? `WhatsApp proveedor: ${contacts.whatsapp}` : "",
    contacts.website || supplier.sourceUrl ? `Fuente proveedor: ${contacts.website || supplier.sourceUrl}` : "",
    contacts.socialUrl ? `Red social: ${contacts.socialUrl}` : ""
  ].filter(Boolean);

  return {
    to: analysis.email,
    subject: `Reporte MaterialQ: ${analysis.product}`,
    body: [
      "Hola,",
      "",
      `Comparto el reporte MaterialQ para ${analysis.product}.`,
      "",
      `Producto: ${analysis.product}`,
      `Cantidad: ${analysis.quantity}`,
      `Entrega requerida: ${analysis.deliveryDate}`,
      `Ubicación base: ${analysis.location}`,
      "",
      `Proveedor seleccionado: ${supplier.name || "Sin proveedor seleccionado"}`,
      `Evaluación: ${supplier.fit || "Sin puntaje"}`,
      `Precio: ${supplier.priceStatus || "Precio no validado"}`,
      `Acción recomendada: ${supplier.recommendedAction || "Validar antes de comprar"}`,
      "",
      "Contactos y fuentes:",
      ...(contactLines.length ? contactLines : ["No se detectaron contactos directos; revisar la fuente web del proveedor."]),
      "",
      "Recomendación MaterialQ:",
      analysis.recommendation,
      "",
      "El PDF se puede descargar desde la vista de reporte.",
      "",
      "Saludos."
    ].join("\n")
  };
}

async function sendReportEmail(payload) {
  if (!payload || !payload.analysis) {
    throw new Error("Analysis is required");
  }

  const email = buildReportEmail(payload.analysis, payload.supplierIndex);

  const delivery = await sendGmailEmail(email);

  return {
    ...delivery,
    email,
    reason: delivery.reason || null
  };
}

module.exports = {
  analyzePurchase,
  buildReportEmail,
  prepareActionPayload,
  sendReportEmail
};
