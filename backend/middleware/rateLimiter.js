// Sliding-window in-memory rate limiter — no external dependencies.
const store = new Map(); // ip -> [timestamp, ...]

export function createRateLimiter({ windowMs = 60_000, max = 20, message } = {}) {
  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = (store.get(ip) || []).filter((t) => t > windowStart);

    if (timestamps.length >= max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    timestamps.push(now);
    store.set(ip, timestamps);

    // Prune the store periodically to prevent unbounded memory growth.
    if (store.size > 10_000) {
      for (const [key, times] of store.entries()) {
        if (times.every((t) => t <= windowStart)) store.delete(key);
      }
    }

    next();
  };
}
