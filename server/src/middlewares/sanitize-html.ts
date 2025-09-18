import sanitizeHtml from "sanitize-html";
import type { Request, Response, NextFunction } from "express";

// configure sanitize-html once
const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

function sanitizeString(value: string): string {
  return sanitizeHtml(value, defaultOptions);
}

// generic recursive sanitizer
function sanitizeObject<T>(obj: T, depth = 0, maxDepth = 5): T {
  if (depth > maxDepth) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((v) => sanitizeObject(v, depth + 1, maxDepth)) as unknown as T;
  }

  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj as object)) {
      const val = (obj as Record<string, unknown>)[k];
      out[k] = sanitizeObject(val, depth + 1, maxDepth);
    }
    return out as T;
  }

  return obj;
}

// Express middleware
export function sanitizeHtmlBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
}
