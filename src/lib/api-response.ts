import { NextResponse } from "next/server";

/**
 * Standardized API Response Utilities
 * Provides type-safe JSON envelopes, HTTP status codes, and optimized caching headers.
 */

export interface ApiResponseOptions {
  status?: number;
  cacheControl?: "no-store" | "private, no-cache" | "public, max-age=60" | "public, max-age=300";
  headers?: Record<string, string>;
}

/**
 * Returns a standardized success JSON response.
 */
export function apiSuccess<T>(data: T, options: ApiResponseOptions = {}) {
  const { status = 200, cacheControl = "no-store", headers = {} } = options;

  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": cacheControl,
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Returns a standardized error JSON response following RFC 7807 principles.
 */
export function apiError(
  message: string,
  status: number = 400,
  code: string = "BAD_REQUEST",
  details?: unknown
) {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    }
  );
}
