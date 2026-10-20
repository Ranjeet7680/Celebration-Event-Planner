import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:")) {
    // If user configured remote PostgreSQL or MySQL in Vercel
    return envUrl;
  }

  // Vercel serverless functions have a read-only root, but /tmp is writable
  if (process.env.VERCEL) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const srcDbPath = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(srcDbPath)) {
      try {
        fs.copyFileSync(srcDbPath, tmpDbPath);
      } catch (e) {
        console.error("Failed to copy SQLite db to /tmp:", e);
      }
    }
    return `file:${tmpDbPath}`;
  }

  return envUrl;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
