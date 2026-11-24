import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { env } from "./env";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "wealth_os_session";
const SECRET_KEY = new TextEncoder().encode(env.AUTH_SECRET);

export interface SessionUser {
  id: string;
  userId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  reportingCurrency: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = (payload.userId as string) || (payload.id as string);

    let finalName = (payload.name as string) || null;
    let finalEmail = (payload.email as string) || "";
    let finalAvatarUrl = (payload.avatarUrl as string) || null;
    let finalCurrency = (payload.reportingCurrency as string) || "IDR";

    // Synchronize latest profile data (Name & Avatar) from PostgreSQL DB
    // so any profile update is immediately reflected across all devices
    try {
      const [dbUser] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
          reportingCurrency: users.reportingCurrency,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (dbUser) {
        if (dbUser.name) finalName = dbUser.name;
        if (dbUser.email) finalEmail = dbUser.email;
        if (dbUser.reportingCurrency) finalCurrency = dbUser.reportingCurrency;
        if (dbUser.avatarUrl) {
          const v = dbUser.updatedAt ? new Date(dbUser.updatedAt).getTime() : 1;
          finalAvatarUrl = `/api/user/avatar?v=${v}`;
        } else {
          finalAvatarUrl = null;
        }
      }
    } catch (dbErr) {
      // In case database is momentarily unreachable, fallback gracefully to token payload
      console.warn("getSession DB sync fallback:", dbErr);
    }

    return {
      id: userId,
      userId: userId,
      email: finalEmail,
      name: finalName,
      avatarUrl: finalAvatarUrl,
      reportingCurrency: finalCurrency,
    };
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
