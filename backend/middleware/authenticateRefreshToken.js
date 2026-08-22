import jwt from "jsonwebtoken";
import { REFRESH_SECRET } from "../utils/jwt.js";

export function authenticateRefreshToken(req, res, next) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    req.refresh = decoded; // { id, iat, exp }
    next();
  } catch {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
}
