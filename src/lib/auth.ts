import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "promptwars_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

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
    console.error("Failed to set session cookie:", e);
  }
}

export async function clearSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (e) {
    console.error("Failed to clear session cookie:", e);
  }
}

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
