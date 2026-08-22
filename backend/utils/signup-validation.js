const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 80;

// Mirrors the client-side signup validation rules so invalid data is
// rejected even when the API is called directly (FR-01, FR-16).
export function validateSignupInput({ email, password, name } = {}) {
  if (!name || !String(name).trim()) return "Name is required";
  if (String(name).trim().length > MAX_NAME_LENGTH) return "Name is too long";
  if (!email) return "Email is required";
  if (!EMAIL_PATTERN.test(String(email).trim())) {
    return "Please enter a valid email";
  }
  if (!password) return "Password is required";
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least 6 characters";
  }
  return null;
}
