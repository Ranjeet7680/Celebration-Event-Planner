/**
 * PromptWars Enterprise Application Logger
 * Provides structured leveled logging with ISO timestamps, context envelopes,
 * and safe production error formatting.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isTest = process.env.NODE_ENV === "test";
  private isProduction = process.env.NODE_ENV === "production";

  private format(level: LogLevel, message: string, error?: unknown, context?: Record<string, unknown>): LogPayload {
    const errMessage = error instanceof Error ? error.message : error ? String(error) : undefined;
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(errMessage ? { error: errMessage } : {}),
      ...(context ? { context } : {}),
    };
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (this.isTest) return;
    const payload = this.format("error", message, error, context);
    if (typeof window === "undefined") {
      process.stderr.write(`[ERROR] ${payload.timestamp} - ${payload.message}${payload.error ? ` | Error: ${payload.error}` : ""}\n`);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.isTest) return;
    const payload = this.format("warn", message, undefined, context);
    if (typeof window === "undefined") {
      process.stdout.write(`[WARN] ${payload.timestamp} - ${payload.message}\n`);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.isTest || this.isProduction) return;
    const payload = this.format("info", message, undefined, context);
    if (typeof window === "undefined") {
      process.stdout.write(`[INFO] ${payload.timestamp} - ${payload.message}\n`);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isTest || this.isProduction) return;
    const payload = this.format("debug", message, undefined, context);
    if (typeof window === "undefined") {
      process.stdout.write(`[DEBUG] ${payload.timestamp} - ${payload.message}\n`);
    }
  }
}

export const logger = new Logger();
