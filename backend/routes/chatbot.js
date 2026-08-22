import { Router } from "express";
import { chatbotService } from "../services/ChatbotService.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

const chatLimit = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: "Too many messages. Please wait a moment before sending again.",
});

const adminLimit = createRateLimiter({ windowMs: 60_000, max: 10 });

// ─── POST /api/chatbot/chat ───────────────────────────────────────────────────
// Streams the assistant reply as Server-Sent Events.
// Body: { message: string, sessionId: string }
router.post("/chat", chatLimit, async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "message is required" });
  }
  if (message.length > 1000) {
    return res
      .status(400)
      .json({ success: false, message: "message exceeds 1000 characters" });
  }
  if (!sessionId || typeof sessionId !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "sessionId is required" });
  }

  // Sanitise the session ID (UUID-ish characters only).
  const safeSession = sessionId.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 64);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  try {
    for await (const chunk of chatbotService.chatStream(
      safeSession,
      message.trim(),
    )) {
      send({ type: "chunk", text: chunk });
    }
    const sources = await chatbotService.getSourceProducts(safeSession);
    send({ type: "done", sources });
  } catch (err) {
    console.error("[chatbot] stream error:", err); // Log the full error object as discussed

    let userMessage = "Something went wrong. Please try again in a moment.";

    // Check for API key issues
    if (err.message?.includes("GEMINI_API_KEY")) {
      userMessage =
        "The chatbot service is not configured. Please contact support.";
    }
    // Check for Google Rate Limits (429)
    else if (
      err.status === 429 ||
      err.message?.includes("429") ||
      err.message?.includes("quota")
    ) {
      userMessage =
        "The assistant is busy right now. Please wait a moment and try again.";
    }
    // Catch Google Server Overloads (503 / high demand)
    else if (
      err.status === 503 ||
      err.message?.includes("503") ||
      err.message?.includes("high demand")
    ) {
      userMessage =
        "Google AI servers are currently overloaded. Please try your message again in a few seconds.";
    }

    send({ type: "error", message: userMessage });
  } finally {
    res.end();
  }
});

// ─── DELETE /api/chatbot/session ──────────────────────────────────────────────
// Clears conversation history for a session.
// Body: { sessionId: string }
router.delete("/session", (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && typeof sessionId === "string") {
    chatbotService.clearSession(
      sessionId.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 64),
    );
  }
  res.json({ success: true, data: { cleared: true } });
});

// ─── POST /api/chatbot/reindex ────────────────────────────────────────────────
// Admin: force-rebuilds the Qdrant vector index from the product catalog.
router.post(
  "/reindex",
  adminLimit,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await chatbotService.reindex();
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("[chatbot] reindex error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to reindex product database" });
    }
  }
);

// ─── GET /api/chatbot/status ──────────────────────────────────────────────────
// Health probe — useful for monitoring.
router.get("/status", async (_req, res) => {
  const data = await chatbotService.getStatus();
  data.activeSessions = chatbotService.activeSessions;
  res.json({ success: true, data });
});

export default router;
