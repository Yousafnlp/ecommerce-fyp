import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const signAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: "user" }, ACCESS_SECRET, {
    expiresIn: "15m",
  });

export const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);
