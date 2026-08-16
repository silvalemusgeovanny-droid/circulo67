const { analyzePurchase } = require("./materialq-agent");

const ANALYSIS_INTENTS = [
  "analiza",
  "analizar",
  "cotiza",
  "cotizar",
  "busca",
  "buscar",
  "proveedores",
  "proveedor",
  "compra",
  "comprar",
  "materia prima"
];

function hasAnalysisIntent(text) {
  const lower = text.toLowerCase();
  const hasIntent = ANALYSIS_INTENTS.some((intent) => lower.includes(intent));
  const hasQuantity = /\b\d+(?:[.,]\d+)?\s?(?:kg|kilos|ton|tons|toneladas|pzas|piezas|m|metros|litros|l)\b/i.test(text);
  const hasDate = /\b20\d{2}-\d{2}-\d{2}\b/.test(text);
  const hasLocation = /(?:ubicaci[oó]n|desde|cerca de|distancia)\b/i.test(text);

  return hasIntent && (hasQuantity || hasDate || hasLocation);
}

function answerQuestion(text) {
  const normalized = String(text || "").trim();
  const lower = normalized.toLowerCase();

  if (!normalized || lower === "/start" || lower.startsWith("/start ")) {
    return {
      type: "help",
      message:
        "Hola, soy MaterialQ. Puedo responder dudas sobre compras y analizar proveedores. Para analizar, escribe algo como: analiza acero inoxidable 304, 500 kg, entrega 2026-09-15, ubicación Guadalajara, distancia 350 km, correo compras@empresa.com"
    };
  }

  if (/^(hola|buenas|hey|hi|hello)\b/i.test(normalized)) {
    return {
      type: "question",
      message:
        "Hola. Soy MaterialQ. Pregúntame qué datos necesito, cómo evalúo proveedores o envíame una compra para analizarla."
    };
  }

  if (lower.includes("qué datos") || lower.includes("que datos") || lower.includes("datos necesitas") || lower.includes("cómo uso") || lower.includes("como uso")) {
    return {
      type: "question",
      message:
        "Necesito producto, cantidad, fecha de entrega, ubicación base, distancia máxima y correo destino. Ejemplo: analiza lámina galvanizada, 2 toneladas, entrega 2026-09-15, ubicación Monterrey, distancia 250 km, correo compras@empresa.com"
    };
  }

  if (lower.includes("qué haces") || lower.includes("que haces") || lower.includes("para qué sirves") || lower.includes("para que sirves")) {
    return {
      type: "question",
      message:
        "Ayudo a compras de materia prima: busco señales de proveedores, comparo calidad, precio, stock, distancia y riesgo, y preparo próximos pasos con evidencia."
    };
  }

  if (lower.includes("cómo evalúas") || lower.includes("como evaluas") || lower.includes("puntaje") || lower.includes("riesgo")) {
    return {
      type: "question",
      message:
        "Evalúo cada proveedor con señales de calidad, precio, stock, ubicación, evidencia pública y riesgo. El resultado es una recomendación, descartes y acciones para validar antes de comprar."
    };
  }

  if (lower.includes("estado") || lower.includes("integraciones") || lower.includes("exa") || lower.includes("notion") || lower.includes("composio")) {
    return {
      type: "question",
      message:
        `Estado beta: Exa ${process.env.EXA_API_KEY ? "listo" : "sin configurar"}, Notion ${process.env.NOTION_TOKEN ? "listo" : "pendiente"}, Composio ${process.env.COMPOSIO_API_KEY ? "listo" : "pendiente"}.`
    };
  }

  if (lower.includes("ayuda") || lower.includes("/help")) {
    return {
      type: "question",
      message:
        "Puedes preguntarme: qué datos necesitas, cómo evalúas proveedores, cuál es el estado de integraciones, o pedirme un análisis con producto, cantidad, fecha, ubicación, distancia y correo."
    };
  }

  return null;
}

function parseTelegramRequest(text) {
  const normalized = String(text || "").trim();
  const directAnswer = answerQuestion(normalized);
  if (directAnswer) return directAnswer;

  if (!hasAnalysisIntent(normalized)) {
    return {
      type: "question",
      message:
        "Puedo contestar dudas de compras o hacer un análisis. Para analizar proveedores, incluye producto, cantidad, entrega, ubicación, distancia y correo. Ejemplo: analiza acero 304, 500 kg, entrega 2026-09-15, ubicación Guadalajara, distancia 350 km, correo compras@empresa.com"
    };
  }

  const email = normalized.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0] || "compras@example.com";
  const date = normalized.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0] || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const quantity = normalized.match(/\b\d+(?:[.,]\d+)?\s?(?:kg|kilos|ton|tons|toneladas|pzas|piezas|m|metros|litros|l)\b/i)?.[0] || "Cantidad no especificada";
  const distance = normalized.match(/\b\d+\s?(?:km|kilómetros|kilometros)\b/i)?.[0] || "100 km";
  const location =
    normalized.match(/(?:ubicaci[oó]n|en|desde|cerca de)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s,.]+?)(?:,?\s+(?:distancia|correo|entrega|fecha|para|$))/i)?.[1]?.trim() ||
    "Ubicación no especificada";

  let product = normalized
    .replace(/\/start/gi, "")
    .replace(/analiza|analizar|cotiza|cotizar|busca|buscar|proveedores|compra|comprar/gi, "")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "")
    .replace(/\b20\d{2}-\d{2}-\d{2}\b/g, "")
    .replace(/\b\d+(?:[.,]\d+)?\s?(?:kg|kilos|ton|tons|toneladas|pzas|piezas|m|metros|litros|l)\b/gi, "")
    .replace(/\b\d+\s?(?:km|kilómetros|kilometros)\b/gi, "")
    .replace(/ubicaci[oó]n|distancia|correo|entrega|fecha|en|desde|cerca de|para/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();

  if (!product || product.length < 3) {
    product = normalized.split(",")[0].replace(/analiza|analizar|busca|buscar/gi, "").trim() || "Materia prima no especificada";
  }
  if (location !== "Ubicación no especificada") {
    product = product.replace(new RegExp(location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  }
  product = product
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    type: "analysis",
    request: {
      product,
      quantity,
      deliveryDate: date,
      location,
      distance,
      email,
      notes: normalized
    }
  };
}

function formatTelegramAnalysis(analysis) {
  const suppliers = (analysis.suppliers || []).slice(0, 3);
  const supplierLines = suppliers.map((supplier, index) => {
    return [
      `${index + 1}. ${supplier.name}`,
      `   Puntaje: ${supplier.fit}`,
      `   Precio: ${supplier.priceStatus}`,
      `   Acción: ${supplier.recommendedAction}`,
      `   Fuente: ${supplier.sourceUrl || "sin URL"}`
    ].join("\n");
  });

  return [
    `MaterialQ - análisis de ${analysis.product}`,
    "",
    analysis.recommendation,
    "",
    "Proveedores principales:",
    supplierLines.join("\n\n"),
    "",
    "Siguiente paso: pide cotización formal, ficha técnica, precio por volumen y confirmación de stock antes de comprar."
  ].join("\n");
}

async function answerTelegramMessage(text) {
  const parsed = parseTelegramRequest(text);
  if (parsed.type === "help" || parsed.type === "question") return parsed.message;

  const analysis = await analyzePurchase(parsed.request);
  return formatTelegramAnalysis(analysis);
}

module.exports = {
  answerQuestion,
  answerTelegramMessage,
  formatTelegramAnalysis,
  hasAnalysisIntent,
  parseTelegramRequest
};
