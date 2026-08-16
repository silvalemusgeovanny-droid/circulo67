let composioClientPromise = null;

async function getComposioClient() {
  if (!process.env.COMPOSIO_API_KEY) {
    return null;
  }

  if (!composioClientPromise) {
    composioClientPromise = import("@composio/core").then(({ Composio }) => {
      return new Composio({
        apiKey: process.env.COMPOSIO_API_KEY,
        toolkitVersions: {
          gmail: "latest"
        }
      });
    });
  }

  return composioClientPromise;
}

function composioUserId() {
  return process.env.COMPOSIO_USER_ID || process.env.COMPOSIO_GMAIL_USER_ID || "default";
}

async function sendGmailEmail({ to, subject, body }) {
  const composio = await getComposioClient();
  if (!composio) {
    return {
      sent: false,
      configured: false,
      reason: "COMPOSIO_API_KEY is required"
    };
  }

  const session = await composio.create(composioUserId());
  const result = await session.execute("GMAIL_SEND_EMAIL", {
    recipient_email: to,
    subject,
    body,
    is_html: false
  });

  return {
    sent: Boolean(result?.successful ?? result?.success ?? true),
    configured: true,
    logId: result?.logId || result?.log_id || null,
    result
  };
}

module.exports = {
  sendGmailEmail
};
