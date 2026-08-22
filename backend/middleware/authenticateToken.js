import jwt from "jsonwebtoken";
import { ACCESS_SECRET } from "../utils/jwt.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
