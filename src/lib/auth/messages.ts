export type AuthRequest =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password";

function errorDetails(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const candidate = error as { code?: unknown; message?: unknown; name?: unknown };
  return [candidate.code, candidate.message, candidate.name]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

export function getFriendlyAuthError(error: unknown, request: AuthRequest) {
  const details = errorDetails(error);

  if (
    details.includes("failed to fetch") ||
    details.includes("network") ||
    details.includes("fetcherror")
  ) {
    return "We could not connect. Please check your internet connection.";
  }

  if (
    details.includes("rate limit") ||
    details.includes("over_email_send_rate_limit") ||
    details.includes("too many request")
  ) {
    return "Too many attempts. Please wait and try again.";
  }

  if (
    request === "signup" &&
    (details.includes("already registered") ||
      details.includes("already been registered") ||
      details.includes("user_already_exists"))
  ) {
    return "An account already exists with this email. Please log in or reset your password.";
  }

  if (
    request === "login" &&
    (details.includes("email not confirmed") ||
      details.includes("email_not_confirmed"))
  ) {
    return "Please confirm your email before logging in.";
  }

  if (
    request === "login" &&
    (details.includes("invalid login credentials") ||
      details.includes("invalid_credentials"))
  ) {
    return "Incorrect email or password.";
  }

  if (
    request === "reset-password" &&
    (details.includes("expired") ||
      details.includes("invalid") ||
      details.includes("session"))
  ) {
    return "This reset link is invalid or has expired. Please request a new one.";
  }

  if (request === "forgot-password") {
    return "We could not send recovery instructions. Please wait and try again.";
  }

  return "We could not complete that request. Please try again.";
}
