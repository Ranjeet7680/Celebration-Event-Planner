import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { logger } from "./logger";

const SESSION_COOKIE_NAME = "promptwars_session";

/**
 * Hashes a plaintext password using bcrypt with a salt round of 10.
 *
 * @param password - Plaintext password string.
 * @returns Cryptographic bcrypt hash.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 *
 * @param password - Plaintext candidate password.
 * @param hash - Bcrypt hash from the database.
 * @returns Boolean indicating whether the candidate matches the hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates an HTTP-only secure session cookie for an authenticated user.
 *
 * @param userId - Unique identifier of the authenticated user.
 */
export async function createSession(userId: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (e) {
    logger.error("Failed to set session cookie", e);
  }
}

/**
 * Destroys the current authenticated user's session cookie.
 */
export async function clearSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (e) {
    logger.error("Failed to clear session cookie", e);
  }
}

/**
 * Resolves the authenticated user from the request session cookie or defaults to the verified demo user.
 *
 * @returns The active user entity with preferences, or null.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const userId = sessionCookie?.value;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true },
      });
      if (user) return user;
    }

    // Default to demo user so pages and demo operations work seamlessly
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@promptwars.ai" },
      include: { preferences: true },
    });
    return demoUser;
  } catch {
    // If during prerendering or static generation cookies() rejects, fallback gracefully
    try {
      return await prisma.user.findUnique({
        where: { email: "demo@promptwars.ai" },
        include: { preferences: true },
      });
    } catch {
      return null;
    }
  }
}
