export const passwordRequirement =
  "Password must contain at least 8 characters, including uppercase and lowercase letters and a number.";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const localPhonePattern = /^0\d{9}$/;
const internationalPhonePattern = /^\+[1-9]\d{7,14}$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizePhone(value: string) {
  return value.trim().replace(/[\s().-]/g, "");
}

export function isValidEmail(value: string) {
  return emailPattern.test(value);
}

export function isValidFullName(value: string) {
  return value.length >= 2 && /\p{L}/u.test(value);
}

export function isValidPhone(value: string) {
  return localPhonePattern.test(value) || internationalPhonePattern.test(value);
}

export function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value)
  );
}
