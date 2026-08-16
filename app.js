const translations = {
  es: {
    betaPill: "Beta privada",
    heroTitle: "Diagnóstico inteligente para compras de materia prima.",
    heroText: "MaterialQ compara proveedores, filtra riesgos y genera reportes claros para decidir con mejor precio, calidad y evidencia.",
    startAnalysis: "Iniciar análisis",
    telegramHeroButton: "Abrir Telegram",
    learnMore: "Ver funcionamiento",
    quality: "Calidad",
    price: "Precio",
    risk: "Riesgo",
    whatWeDoEyebrow: "Qué hacemos",
    whatWeDoTitle: "Una beta para investigar, comparar y reportar compras con más control.",
    featureOneTitle: "Diagnóstico de proveedores",
    featureOneText: "Detecta reputación débil, stock incierto, precios altos y señales de baja calidad.",
    featureTwoTitle: "Optimización calidad-precio",
    featureTwoText: "Prioriza opciones con buena evidencia, costo competitivo y distancia compatible.",
    featureThreeTitle: "Reporte accionable",
    featureThreeText: "Prepara un PDF con fuentes, descartes, recomendación y próximos pasos.",
    analysisPanel: "Panel de análisis",
    requestTitle: "Nueva búsqueda",
    productLabel: "Producto o materia prima",
    quantityLabel: "Cantidad",
    dateLabel: "Fecha de entrega",
    locationLabel: "Ubicación base",
    distanceLabel: "Distancia máxima",
    emailLabel: "Correo destino",
    notesLabel: "Requisitos adicionales",
    runAnalysis: "Analizar compra",
    historyEyebrow: "Memoria del cliente",
    historyTitle: "Historial por correo",
    historyButton: "Ver historial",
    requestPinButton: "Enviar PIN",
    verifyPinButton: "Verificar",
    historyEmpty: "Ingresa un correo y solicita un PIN para consultar análisis anteriores.",
    historyChecking: "Revisando si hay historial...",
    historyUnavailable: "Este correo aún no tiene consultas previas.",
    agentOutput: "Salida del agente",
    emptyTitle: "Esperando parámetros",
    betaReady: "Beta lista",
    qualityScore: "Calidad",
    priceScore: "Precio",
    supplierRisk: "Riesgo",
    stockStatus: "Stock",
    recommendation: "Recomendación",
    emptyRecommendation: "Ingresa los datos de compra para generar el diagnóstico.",
    discarded: "Opciones descartadas",
    emptyDiscard: "Aún no hay análisis.",
    supplier: "Proveedor",
    fit: "Ajuste",
    distance: "Distancia",
    evidence: "Evidencia",
    emptyTable: "Los proveedores aparecerán aquí.",
    pdfButton: "Descargar PDF",
    emailButton: "Enviar al correo",
    telegramButton: "Abrir bot de Telegram",
    confirmationNote: "Las acciones externas se preparan primero y requieren confirmación antes de enviarse.",
    integrationsEyebrow: "Ecosistema empresarial",
    integrationsTitle: "Una capa de inteligencia para compras con trazabilidad, evidencia y control humano.",
    marketIntelTitle: "Investigación de mercado",
    traceabilityTitle: "Trazabilidad operativa",
    workflowTitle: "Ejecución controlada",
    channelTitle: "Canal de seguimiento",
    exaText: "Localiza proveedores, evidencia pública, señales de stock y referencias de cotización con fuentes verificables.",
    notionText: "Conserva historial por correo, decisiones, reportes, proveedores evaluados y memoria comercial reutilizable.",
    composioText: "Prepara correos, archivos y flujos de seguimiento sin enviar nada sensible hasta recibir confirmación.",
    telegramText: "Permite consultas rápidas sobre análisis, proveedores y próximos pasos desde un bot autorizado.",
    footerText: "Inteligencia de compras con confirmación humana."
  },
  en: {
    betaPill: "Private beta",
    heroTitle: "Intelligent diagnostics for raw material procurement.",
    heroText: "MaterialQ compares suppliers, filters risks, and creates clear reports for decisions backed by price, quality, and evidence.",
    startAnalysis: "Start analysis",
    telegramHeroButton: "Open Telegram",
    learnMore: "See workflow",
    quality: "Quality",
    price: "Price",
    risk: "Risk",
    whatWeDoEyebrow: "What we do",
    whatWeDoTitle: "A beta for researching, comparing, and reporting purchases with more control.",
    featureOneTitle: "Supplier diagnosis",
    featureOneText: "Detects weak reputation, uncertain stock, high prices, and low-quality signals.",
    featureTwoTitle: "Quality-price optimization",
    featureTwoText: "Prioritizes options with strong evidence, competitive cost, and compatible distance.",
    featureThreeTitle: "Actionable report",
    featureThreeText: "Prepares a PDF with sources, exclusions, recommendation, and next steps.",
    analysisPanel: "Analysis panel",
    requestTitle: "New search",
    productLabel: "Product or raw material",
    quantityLabel: "Quantity",
    dateLabel: "Delivery date",
    locationLabel: "Base location",
    distanceLabel: "Maximum distance",
    emailLabel: "Recipient email",
    notesLabel: "Additional requirements",
    runAnalysis: "Analyze purchase",
    historyEyebrow: "Client memory",
    historyTitle: "Email history",
    historyButton: "View history",
    requestPinButton: "Send PIN",
    verifyPinButton: "Verify",
    historyEmpty: "Enter an email and request a PIN to load previous analyses.",
    historyChecking: "Checking for history...",
    historyUnavailable: "This email has no previous requests yet.",
    agentOutput: "Agent output",
    emptyTitle: "Waiting for parameters",
    betaReady: "Beta ready",
    qualityScore: "Quality",
    priceScore: "Price",
    supplierRisk: "Risk",
    stockStatus: "Stock",
    recommendation: "Recommendation",
    emptyRecommendation: "Enter purchase data to generate the diagnosis.",
    discarded: "Discarded options",
    emptyDiscard: "No analysis yet.",
    supplier: "Supplier",
    fit: "Fit",
    distance: "Distance",
    evidence: "Evidence",
    emptyTable: "Suppliers will appear here.",
    pdfButton: "Download PDF",
    emailButton: "Send email",
    telegramButton: "Open Telegram bot",
    confirmationNote: "External actions are prepared first and require confirmation before sending.",
    integrationsEyebrow: "Enterprise ecosystem",
    integrationsTitle: "An intelligence layer for procurement with traceability, evidence, and human control.",
    marketIntelTitle: "Market intelligence",
    traceabilityTitle: "Operational traceability",
    workflowTitle: "Controlled execution",
    channelTitle: "Follow-up channel",
    exaText: "Finds suppliers, public evidence, stock signals, and quotation references through verifiable sources.",
    notionText: "Stores history by email, decisions, reports, evaluated suppliers, and reusable commercial memory.",
    composioText: "Prepares email, files, and follow-up workflows without sending sensitive actions until confirmed.",
    telegramText: "Enables quick questions about analyses, suppliers, and next steps through an authorized bot.",
    footerText: "Procurement intelligence with human confirmation."
  }
};

let currentLanguage = "es";
let lastAnalysis = null;
let currentHistory = null;
let selectedSupplierIndex = 0;
let historyAccessToken = null;
let historyEmail = "";
const LOCAL_HISTORY_KEY = "materialq.history.v1";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  $$("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (translations[language][key]) node.textContent = translations[language][key];
  });
  $("#languageToggle").textContent = language === "es" ? "EN" : "ES";
}

function t(key) {
  return translations[currentLanguage][key] || key;
}

function formDataToPayload(formData) {
  return {
    product: formData.get("product").trim(),
    quantity: formData.get("quantity").trim(),
    deliveryDate: formData.get("deliveryDate"),
    location: formData.get("location").trim(),
    distance: formData.get("distance").trim(),
    email: formData.get("email").trim(),
    notes: formData.get("notes").trim()
  };
}

function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function saveLocalAnalysis(analysis) {
  const items = getLocalHistory();
  const item = {
    id: analysis.id,
    url: analysis.notion?.url || "",
    createdAt: analysis.createdAt,
    name: `${analysis.product} - ${analysis.quantity}`,
    product: analysis.product,
    quantity: analysis.quantity,
    deliveryDate: analysis.deliveryDate,
    location: analysis.location,
    email: analysis.email,
    risk: analysis.risk,
    stock: analysis.stock,
    quality: analysis.quality,
    price: analysis.price,
    recommendation: analysis.recommendation,
    topSupplier: analysis.suppliers?.[0]?.name || "",
    sourceUrl: analysis.suppliers?.[0]?.sourceUrl || "",
    analysisId: analysis.id,
    source: "local"
  };
  const deduped = items.filter((entry) => entry.analysisId !== item.analysisId);
  deduped.unshift(item);
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(deduped.slice(0, 50)));
}

function getLocalHistoryByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return getLocalHistory().filter((item) => String(item.email || "").toLowerCase() === normalizedEmail);
}

function apiUrls(path) {
  if (window.location.protocol === "file:") {
    return [`http://localhost:3000${path}`, `http://localhost:3001${path}`];
  }
  return [path];
}

async function postJson(url, payload) {
  let response;
  let lastError;
  for (const candidateUrl of apiUrls(url)) {
    try {
      response = await fetch(candidateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    const message = window.location.protocol === "file:"
      ? "Abre la app desde http://localhost:3000 o http://localhost:3001 después de correr npm run dev. El archivo HTML directo no puede hablar con el backend si el servidor no está activo."
      : "No se pudo conectar con el backend. Revisa que npm run dev esté corriendo.";
    throw new Error(message);
  }

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function selectedSupplier() {
  return lastAnalysis?.suppliers?.[selectedSupplierIndex] || lastAnalysis?.suppliers?.[0] || null;
}

function contactButtons(supplier, index) {
  const contacts = supplier.contacts || {};
  const buttons = [
    contacts.website || supplier.sourceUrl
      ? `<a class="contact-button" href="${contacts.website || supplier.sourceUrl}" target="_blank" rel="noreferrer">Sitio</a>`
      : "",
    contacts.email
      ? `<a class="contact-button" href="mailto:${contacts.email}?subject=${encodeURIComponent(`Cotización ${lastAnalysis?.product || ""}`)}">Correo</a>`
      : "",
    contacts.phone
      ? `<a class="contact-button" href="tel:${contacts.phone.replace(/\s+/g, "")}">Teléfono</a>`
      : "",
    contacts.whatsapp
      ? `<a class="contact-button" href="${contacts.whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a>`
      : "",
    contacts.socialUrl
      ? `<a class="contact-button" href="${contacts.socialUrl}" target="_blank" rel="noreferrer">Red</a>`
      : ""
  ].filter(Boolean);

  return [
    `<button class="supplier-select ${index === selectedSupplierIndex ? "is-selected" : ""}" type="button" data-supplier-index="${index}">${index === selectedSupplierIndex ? "Seleccionado" : "Elegir"}</button>`,
    buttons.length ? `<div class="contact-row">${buttons.join("")}</div>` : `<small>Sin contacto directo detectado; usa la fuente web.</small>`
  ].join("");
}

function buildReportEmailBody(includePdfNote) {
  const supplier = selectedSupplier();
  const contacts = supplier?.contacts || {};
  const contactLines = [
    contacts.email ? `Correo proveedor: ${contacts.email}` : "",
    contacts.phone ? `Teléfono proveedor: ${contacts.phone}` : "",
    contacts.whatsapp ? `WhatsApp proveedor: ${contacts.whatsapp}` : "",
    contacts.website || supplier?.sourceUrl ? `Fuente proveedor: ${contacts.website || supplier.sourceUrl}` : "",
    contacts.socialUrl ? `Red social: ${contacts.socialUrl}` : ""
  ].filter(Boolean);

  return [
    "Hola,",
    "",
    `Comparto el reporte MaterialQ para ${lastAnalysis.product}.`,
    "",
    `Producto: ${lastAnalysis.product}`,
    `Cantidad: ${lastAnalysis.quantity}`,
    `Entrega requerida: ${lastAnalysis.deliveryDate}`,
    `Ubicación base: ${lastAnalysis.location}`,
    "",
    `Proveedor seleccionado: ${supplier?.name || "Sin proveedor seleccionado"}`,
    `Evaluación: ${supplier?.fit || "Sin puntaje"}`,
    `Precio: ${supplier?.priceStatus || "Precio no validado"}`,
    `Acción recomendada: ${supplier?.recommendedAction || "Validar antes de comprar"}`,
    "",
    "Contactos y fuentes:",
    ...(contactLines.length ? contactLines : ["No se detectaron contactos directos; revisar la fuente web del proveedor."]),
    "",
    "Recomendación MaterialQ:",
    lastAnalysis.recommendation,
    "",
    includePdfNote
      ? "Nota: adjunto o enviaré el PDF generado desde la vista de reporte."
      : "Nota: este correo se preparó sin imprimir PDF.",
    "",
    "Saludos."
  ].join("\n");
}

function openReportEmail(includePdfNote) {
  const subject = encodeURIComponent(`Reporte MaterialQ: ${lastAnalysis.product}`);
  const body = encodeURIComponent(buildReportEmailBody(includePdfNote));
  window.location.href = `mailto:${lastAnalysis.email}?subject=${subject}&body=${body}`;
}

function renderAnalysis(analysis) {
  selectedSupplierIndex = Math.min(selectedSupplierIndex, (analysis.suppliers || []).length - 1);
  if (selectedSupplierIndex < 0) selectedSupplierIndex = 0;
  $("#reportTitle").textContent = `MaterialQ: ${analysis.product}`;
  $("#statusChip").textContent = currentLanguage === "es" ? "Análisis beta" : "Beta analysis";
  $("#qualityScore").textContent = analysis.quality;
  $("#priceScore").textContent = analysis.price;
  $("#riskScore").textContent = analysis.risk;
  $("#stockScore").textContent = analysis.stock;
  $("#recommendationText").textContent = analysis.recommendation;

  $("#discardList").innerHTML = analysis.discarded.map((item) => `<li>${item}</li>`).join("");
  $("#supplierTable").innerHTML = analysis.suppliers
    .map((supplier, index) => `
      <tr>
        <td>
          <strong>${supplier.name}</strong>
          <small>${supplier.domain || ""}</small>
          ${contactButtons(supplier, index)}
        </td>
        <td>
          <strong>${supplier.fit}</strong>
          <small>Calidad ${supplier.scores?.quality || "--"} · Precio ${supplier.scores?.price || "--"} · Stock ${supplier.scores?.stock || "--"} · Riesgo ${supplier.scores?.risk || "--"}</small>
        </td>
        <td>
          <strong>${supplier.priceStatus || "Precio no público"}</strong>
          <small>${supplier.priceEvidence || ""}</small>
        </td>
        <td>
          <strong>${supplier.recommendedAction || ""}</strong>
          <small>${supplier.evidence}</small>
          ${supplier.sourceUrl ? `<a class="source-link" href="${supplier.sourceUrl}" target="_blank" rel="noreferrer">Fuente original</a>` : ""}
        </td>
      </tr>
    `)
    .join("");

  const warningText = analysis.warnings && analysis.warnings.length ? ` Advertencia: ${analysis.warnings.join(" ")}` : "";
  const notionText = analysis.notion?.saved
    ? ` Guardado en Notion: ${analysis.notion.url}.`
    : analysis.notion?.configured === false
      ? " Notion no configurado."
      : analysis.notion?.reason
        ? ` Notion no guardó: ${analysis.notion.reason}.`
        : "";
  $("#confirmationNote").textContent =
    `Reporte preparado para ${analysis.email}. Fuentes Exa: ${(analysis.sources || []).length}.${notionText}${warningText} Cualquier envío requerirá confirmación.`;

  const message = encodeURIComponent(
    `Hola MaterialQ, quiero dar seguimiento al análisis de ${analysis.product} para ${analysis.quantity}.`
  );
  $("#heroTelegramButton").href = `https://t.me/circulo67_bot?text=${message}`;
}

function renderHistory(history) {
  const historyList = $("#historyList");
  currentHistory = history;
  $("#historyButton").disabled = history.items.length === 0;

  if (!history.configured && history.items.length === 0) {
    historyList.innerHTML = `<p>${currentLanguage === "es" ? "Notion no está configurado todavía." : "Notion is not configured yet."}</p>`;
    return;
  }

  if (!history.items.length) {
    historyList.innerHTML = `<p>${currentLanguage === "es" ? "No hay análisis previos para este correo." : "No previous analyses for this email."}</p>`;
    return;
  }

  historyList.innerHTML = history.items
    .map((item) => {
      const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "";
      const title = item.product || item.name || "Análisis MaterialQ";
      return `
        <article class="history-item">
          <div>
            <strong>${title}</strong>
            <small>${item.quantity || "Sin cantidad"} · ${item.location || "Sin ubicación"} · ${date}</small>
          </div>
          <p>${item.recommendation || "Sin recomendación guardada."}</p>
          <div class="history-meta">
            <span>Riesgo: ${item.risk || "--"}</span>
            <span>Stock: ${item.stock || "--"}</span>
            <span>Proveedor: ${item.topSupplier || "--"}</span>
            <span>${item.source === "local" ? "Local" : "Notion"}</span>
          </div>
          ${item.url ? `<a class="source-link" href="${item.url}" target="_blank" rel="noreferrer">Abrir en Notion</a>` : ""}
        </article>
      `;
    })
    .join("");
}

async function fetchHistory(email, limit = 10) {
  const data = await postJson("/api/history", {
    email,
    limit,
    accessToken: historyAccessToken
  });
  return data.history;
}

function resetHistoryAccess(message) {
  currentHistory = null;
  historyAccessToken = null;
  historyEmail = "";
  $("#historyButton").disabled = true;
  $("#historyList").innerHTML = `<p>${message || t("historyEmpty")}</p>`;
}

async function requestHistoryPin() {
  const email = $("#email").value.trim();
  if (!email) {
    resetHistoryAccess(t("historyEmpty"));
    return;
  }

  try {
    resetHistoryAccess(currentLanguage === "es" ? "Enviando PIN..." : "Sending PIN...");
    const data = await postJson("/api/history/request-pin", { email });
    $("#historyList").innerHTML = data.delivery.sent
      ? `<p>${currentLanguage === "es" ? "PIN enviado. Revisa tu correo e ingrésalo aquí." : "PIN sent. Check your email and enter it here."}</p>`
      : `<p>${currentLanguage === "es" ? "No se pudo enviar el PIN por correo todavía:" : "Could not email the PIN yet:"} ${data.delivery.reason}. ${currentLanguage === "es" ? "Historial bloqueado hasta verificar PIN." : "History remains locked until PIN verification."}</p>`;
  } catch (error) {
    resetHistoryAccess(`${currentLanguage === "es" ? "No se pudo solicitar el PIN:" : "Could not request PIN:"} ${error.message}`);
  }
}

async function verifyHistoryPin() {
  const email = $("#email").value.trim();
  const pin = $("#historyPin").value.trim();
  if (!email) {
    resetHistoryAccess(t("historyEmpty"));
    return;
  }
  if (!/^\d{6}$/.test(pin)) {
    $("#historyList").innerHTML = `<p>${currentLanguage === "es" ? "Ingresa el PIN de 6 dígitos." : "Enter the 6-digit PIN."}</p>`;
    return;
  }

  try {
    $("#historyList").innerHTML = `<p>${currentLanguage === "es" ? "Verificando PIN..." : "Verifying PIN..."}</p>`;
    const data = await postJson("/api/history/verify-pin", { email, pin });
    historyAccessToken = data.accessToken;
    historyEmail = email.toLowerCase();
    $("#historyButton").disabled = false;
    $("#historyList").innerHTML = `<p>${currentLanguage === "es" ? "PIN verificado. Ya puedes abrir el historial." : "PIN verified. You can now open history."}</p>`;
  } catch (error) {
    resetHistoryAccess(`${currentLanguage === "es" ? "PIN no válido:" : "Invalid PIN:"} ${error.message}`);
  }
}

async function loadHistory() {
  const email = $("#email").value.trim();
  if (!email || !historyAccessToken || historyEmail !== email.toLowerCase()) {
    resetHistoryAccess(currentLanguage === "es" ? "Solicita y verifica un PIN antes de ver el historial." : "Request and verify a PIN before viewing history.");
    return;
  }

  $("#historyList").innerHTML = `<p>${t("historyChecking")}</p>`;

  try {
    const history = await fetchHistory(email, 10);
    const localItems = getLocalHistoryByEmail(email);
    const mergedItems = [
      ...history.items,
      ...localItems.filter((localItem) => !history.items.some((item) => item.analysisId === localItem.analysisId))
    ];
    renderHistory({
      ...history,
      items: mergedItems
    });
  } catch (error) {
    resetHistoryAccess(`${currentLanguage === "es" ? "No se pudo cargar el historial:" : "Could not load history:"} ${error.message}`);
  }
}

async function prepareAction(type) {
  if (!lastAnalysis) {
    alert(currentLanguage === "es" ? "Primero genera un análisis." : "Generate an analysis first.");
    return;
  }

  if (type === "pdf") {
    $("#confirmationNote").textContent =
      currentLanguage === "es"
        ? "Se abrirá la impresión. Elige Guardar como PDF si quieres descargarlo."
        : "The print dialog will open. Choose Save as PDF to download it.";
    window.print();
    return;
  }

  try {
    if (type === "email") {
      const data = await postJson("/api/actions/send-email", {
        analysis: lastAnalysis,
        supplierIndex: selectedSupplierIndex
      });
      $("#confirmationNote").textContent = data.email.sent
        ? `Reporte enviado a ${data.email.email.to}.`
        : `No se envió todavía: ${data.email.reason}. Puedes descargar el PDF o conectar Composio/Gmail para envío real.`;
      return;
    }

    const data = await postJson("/api/actions/prepare", { type, analysis: lastAnalysis });
    $("#confirmationNote").textContent = data.action.preview;
  } catch (error) {
    const messages = {
      email: `No se pudo enviar el reporte: ${error.message}`,
      telegram: "Mensaje de Telegram preparado. El bot @circulo67_bot podrá responder cuando el usuario inicie conversación."
    };
    $("#confirmationNote").textContent = messages[type];
  }
}

function openTelegramBot() {
  const baseUrl = "https://t.me/circulo67_bot";
  const startUrl = `${baseUrl}?start=materialq`;

  if (!lastAnalysis) {
    window.open(startUrl, "_blank", "noopener,noreferrer");
    $("#confirmationNote").textContent =
      currentLanguage === "es"
        ? "Se abrió Telegram. Presiona Start y escribe tu consulta para activar el bot."
        : "Telegram opened. Press Start and send your question to activate the bot.";
    return;
  }

  const message = encodeURIComponent(
    `Hola MaterialQ, quiero dar seguimiento al análisis de ${lastAnalysis.product} para ${lastAnalysis.quantity}.`
  );
  window.open(`${baseUrl}?text=${message}`, "_blank", "noopener,noreferrer");
  $("#confirmationNote").textContent =
    currentLanguage === "es"
      ? "Se abrió Telegram con un mensaje sugerido. Envíalo para iniciar el seguimiento."
      : "Telegram opened with a suggested message. Send it to start follow-up.";
}

$("#languageToggle").addEventListener("click", () => {
  setLanguage(currentLanguage === "es" ? "en" : "es");
});

$("#analysisForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  $("#statusChip").textContent = currentLanguage === "es" ? "Analizando" : "Analyzing";
  $("#confirmationNote").textContent =
    currentLanguage === "es" ? "Consultando backend de MaterialQ..." : "Calling MaterialQ backend...";

  try {
    const data = await postJson("/api/analyze", formDataToPayload(formData));
    lastAnalysis = data.analysis;
    selectedSupplierIndex = 0;
  } catch (error) {
    lastAnalysis = null;
    $("#statusChip").textContent = currentLanguage === "es" ? "Error" : "Error";
    $("#reportTitle").textContent = currentLanguage === "es" ? "No se pudo analizar" : "Analysis failed";
    $("#qualityScore").textContent = "--";
    $("#priceScore").textContent = "--";
    $("#riskScore").textContent = "--";
    $("#stockScore").textContent = "--";
    $("#recommendationText").textContent =
      currentLanguage === "es"
        ? "No voy a mostrar proveedores genéricos. Revisa que el backend y Exa estén activos e intenta de nuevo."
        : "I will not show generic suppliers. Check that the backend and Exa are active, then try again.";
    $("#discardList").innerHTML = `<li>${error.message}</li>`;
    $("#supplierTable").innerHTML = `
      <tr>
        <td colspan="4">${currentLanguage === "es" ? "Sin datos reales de proveedor." : "No real supplier data."}</td>
      </tr>
    `;
    $("#confirmationNote").textContent =
      currentLanguage === "es"
        ? `Error del análisis: ${error.message}`
        : `Analysis error: ${error.message}`;
    return;
  }

  saveLocalAnalysis(lastAnalysis);
  renderAnalysis(lastAnalysis);
  resetHistoryAccess(currentLanguage === "es" ? "Para ver historial, solicita un PIN al correo." : "To view history, request an email PIN.");
});

$("#pdfButton").addEventListener("click", () => prepareAction("pdf"));
$("#emailButton").addEventListener("click", () => prepareAction("email"));
$("#telegramButton").addEventListener("click", openTelegramBot);
$("#requestPinButton").addEventListener("click", requestHistoryPin);
$("#verifyPinButton").addEventListener("click", verifyHistoryPin);
$("#historyButton").addEventListener("click", loadHistory);
$("#supplierTable").addEventListener("click", (event) => {
  const button = event.target.closest("[data-supplier-index]");
  if (!button || !lastAnalysis) return;
  selectedSupplierIndex = Number(button.dataset.supplierIndex);
  renderAnalysis(lastAnalysis);
  $("#confirmationNote").textContent =
    `Proveedor seleccionado: ${selectedSupplier()?.name || "sin proveedor"}. Usa sus botones de contacto o prepara el correo.`;
});
$("#email").addEventListener("input", () => {
  resetHistoryAccess();
});

setLanguage("es");
