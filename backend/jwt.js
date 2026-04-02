import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";
const ACCESS_SECRET =
  process.env.ACCESS_SECRET ||
  (isProduction ? null : "dev-access-secret-change-me");
const REFRESH_SECRET =
  process.env.REFRESH_SECRET ||
  (isProduction ? null : "dev-refresh-secret-change-me");

function requireSecret(secret, name) {
  if (!secret) {
    throw new Error(`${name} is not set`);
  }

  return secret;
}

export const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role || "user" },
    requireSecret(ACCESS_SECRET, "ACCESS_SECRET"),
    {
      expiresIn: "15m",
    },
  );

export const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, requireSecret(REFRESH_SECRET, "REFRESH_SECRET"), {
    expiresIn: "7d",
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, requireSecret(REFRESH_SECRET, "REFRESH_SECRET"));
