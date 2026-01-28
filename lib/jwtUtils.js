import { jwtDecode } from "jwt-decode";

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getUserIdFromToken(token) {
  try {
    return jwtDecode(token).id;
  } catch {
    return null;
  }
}
