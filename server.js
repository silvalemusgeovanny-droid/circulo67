const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { analyzePurchase, prepareActionPayload, sendReportEmail } = require("./src/agent/materialq-agent");
const { answerTelegramMessage } = require("./src/agent/telegram-agent");
const { sendGmailEmail } = require("./src/integrations/composio");
const { getAnalysisHistoryByEmail } = require("./src/integrations/notion");

loadEnvFile(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = __dirname;
const historyPins = new Map();
const historySessions = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function integrationState(name, configured) {
  return {
    name,
    configured,
    status: configured ? "ready" : "missing_env"
  };
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Valid email is required");
  }
  return email;
}

function createPin() {
  return String(crypto.randomInt(100000, 1000000));
}

async function sendHistoryPin(email, pin) {
  return sendGmailEmail({
    to: email,
    subject: "Tu PIN de historial MaterialQ",
    body: [
      "Hola,",
      "",
      `Tu PIN para consultar el historial de MaterialQ es: ${pin}`,
      "",
      "Este PIN expira en 10 minutos. Si no lo solicitaste, puedes ignorar este correo.",
      "",
      "MaterialQ"
    ].join("\n")
  });
}

function verifyHistoryAccess(email, accessToken) {
  const session = historySessions.get(String(accessToken || ""));
  return Boolean(session && session.email === email && session.expiresAt > Date.now());
}

function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR) || filePath.includes(`${path.sep}src${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(content);
  });
}

async function handleApi(request, response, pathname) {
  try {
    if (request.method === "GET" && pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        service: "MaterialQ",
        integrations: {
          exa: integrationState("Exa", Boolean(process.env.EXA_API_KEY)),
          notion: integrationState(
            "Notion",
            Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID)
          ),
          composio: integrationState("Composio", Boolean(process.env.COMPOSIO_API_KEY))
        }
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/analyze") {
      const payload = await readJson(request);
      const analysis = await analyzePurchase(payload);
      sendJson(response, 200, { ok: true, analysis });
      return;
    }

    if (request.method === "POST" && pathname === "/api/actions/prepare") {
      const payload = await readJson(request);
      const action = prepareActionPayload(payload);
      sendJson(response, 200, { ok: true, action });
      return;
    }

    if (request.method === "POST" && pathname === "/api/actions/send-email") {
      const payload = await readJson(request);
      const email = await sendReportEmail(payload);
      sendJson(response, 200, { ok: true, email });
      return;
    }

    if (request.method === "POST" && pathname === "/api/history/request-pin") {
      const payload = await readJson(request);
      const email = normalizeEmail(payload.email);
      const pin = createPin();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      historyPins.set(email, {
        pin,
        expiresAt,
        attempts: 0
      });
      const delivery = await sendHistoryPin(email, pin);
      if (!delivery.sent) {
        console.log(`MaterialQ history PIN for ${email}: ${pin}`);
      }
      sendJson(response, 200, {
        ok: true,
        delivery: {
          sent: delivery.sent,
          configured: delivery.configured,
          reason: delivery.reason,
          expiresInMinutes: 10
        }
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/history/verify-pin") {
      const payload = await readJson(request);
      const email = normalizeEmail(payload.email);
      const pinRecord = historyPins.get(email);

      if (!pinRecord || pinRecord.expiresAt <= Date.now()) {
        throw new Error("PIN expired or not requested");
      }

      pinRecord.attempts += 1;
      if (pinRecord.attempts > 5) {
        historyPins.delete(email);
        throw new Error("Too many PIN attempts");
      }

      if (String(payload.pin || "").trim() !== pinRecord.pin) {
        throw new Error("Invalid PIN");
      }

      historyPins.delete(email);
      const accessToken = crypto.randomBytes(24).toString("hex");
      historySessions.set(accessToken, {
        email,
        expiresAt: Date.now() + 30 * 60 * 1000
      });

      sendJson(response, 200, {
        ok: true,
        accessToken,
        expiresInMinutes: 30
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/history") {
      const payload = await readJson(request);
      const email = normalizeEmail(payload.email);
      if (!verifyHistoryAccess(email, payload.accessToken)) {
        throw new Error("History access requires a valid PIN session");
      }
      const history = await getAnalysisHistoryByEmail(email, payload.limit);
      sendJson(response, 200, { ok: true, history });
      return;
    }

    if (request.method === "POST" && pathname === "/api/telegram/answer") {
      const payload = await readJson(request);
      const answer = await answerTelegramMessage(payload.text || payload.message || "");
      sendJson(response, 200, { ok: true, answer });
      return;
    }

    sendJson(response, 404, { ok: false, error: "API route not found" });
  } catch (error) {
    sendJson(response, 400, { ok: false, error: error.message });
  }
}

function requestHandler(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    handleApi(request, response, url.pathname);
    return;
  }

  serveStatic(request, response, decodeURIComponent(url.pathname));
}

if (require.main === module) {
  const server = http.createServer(requestHandler);
  server.listen(PORT, () => {
    console.log(`MaterialQ running at http://localhost:${PORT}`);
  });
}

module.exports = requestHandler;
