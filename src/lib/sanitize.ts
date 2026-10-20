/**
 * Input Sanitization & Security Normalization Utility
 * Mitigates Cross-Site Scripting (XSS), malicious script injections, and malformed characters.
 */

/**
 * Sanitizes a string by stripping dangerous HTML tags and script elements,
 * escaping angle brackets and normalizing whitespace.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:[^"']*/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Strips dangerous HTML and scripts while preserving standard punctuation for rich descriptions.
 */
export function sanitizePlainString(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

/**
 * Recursively sanitizes string fields within an object or array payload.
 */
export function sanitizePayload<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizePlainString(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (data !== null && typeof data === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }

  return data;
}
