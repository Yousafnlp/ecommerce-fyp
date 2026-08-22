import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { authenticateRefreshToken } from "../middleware/authenticateRefreshToken.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const authLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 50,
  message: "Too many authentication attempts. Please try again later.",
});

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post("/signup", authLimit, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    res.json({
      data: { user: User.removePassword(user), token: accessToken },
      success: true,
    });
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).json({ error: "Signup failed", success: false });
  }
});

router.post("/signin", authLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const found = await User.findByEmail(email);
    if (!found) return res.status(400).json({ error: "Invalid credentials" });

    const { passwordHash, ...user } = found;
    const match = await bcrypt.compare(password, passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    if (user.status === "disabled") {
      return res.status(403).json({
        error: "This account has been disabled. Contact an administrator.",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        user: user,
        token: accessToken,
      },
      success: true,
    });
  } catch (err) {
    console.error("Signin failed:", err);
    res.status(500).json({ error: "Signin failed", success: false });
  }
});

router.post("/signout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    path: "/api/auth/refresh",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ success: true });
});

router.get("/fetchUser", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const found = await User.findById(userId);
    if (!found) return res.status(400).json({ error: "Invalid credentials" });

    if (found.status === "disabled") {
      return res.status(403).json({ error: "This account has been disabled" });
    }

    const { passwordHash, ...user } = found;

    res.json({
      success: true,
      data: user,
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.post("/refresh", authLimit, authenticateRefreshToken, async (req, res) => {
  try {
    const userId = req.refresh.id;
    const found = await User.findById(userId);
    if (!found) return res.status(400).json({ error: "Invalid credentials" });

    if (found.status === "disabled") {
      return res.status(403).json({ error: "This account has been disabled" });
    }

    const { passwordHash, ...user } = found;

    const accessToken = signAccessToken(user);

    res.json({
      success: true,
      data: { token: accessToken },
    });
  } catch (err) {
    console.error("Token refresh failed:", err);
    res.status(500).json({ error: "Token refresh failed", success: false });
  }
});

export default router;
