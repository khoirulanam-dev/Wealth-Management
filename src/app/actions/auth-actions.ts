"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { createSession, destroySession, getSession, verifyPassword } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    // Dynamic database authentication query via Neon PostgreSQL + Drizzle ORM
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { error: "Akun tidak ditemukan. Pastikan email terdaftar di database." };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "Password yang Anda masukkan tidak valid." };
    }

    await createSession({
      id: user.id,
      userId: user.id,
      email: user.email,
      reportingCurrency: user.reportingCurrency || "IDR",
    });
  } catch (err) {
    console.error("Database authentication error:", err);
    return { error: "Gagal menghubungkan ke database otentikasi. Silakan periksa koneksi Neon." };
  }

  redirect("/overview");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function checkSessionAction() {
  return await getSession();
}
