"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { createSession, destroySession, getSession, requireAuth, verifyPassword, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
      name: user.name || null,
      avatarUrl: user.avatarUrl ? "/api/user/avatar" : null,
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

export async function updateProfileAction(data: {
  name?: string;
  email: string;
  reportingCurrency: string;
  newPassword?: string;
  avatarDataUrl?: string;
}) {
  const session = await requireAuth();

  try {
    const cleanEmail = data.email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: "Alamat email wajib diisi." };
    }

    let finalAvatarUrl: string | null | undefined = undefined;

    if (data.avatarDataUrl === "") {
      // User removed avatar
      finalAvatarUrl = null;
    } else if (data.avatarDataUrl && data.avatarDataUrl.startsWith("data:image/")) {
      // Store Base64 image data directly in PostgreSQL database (zero files in project folder)
      finalAvatarUrl = data.avatarDataUrl;
    }

    // Prepare update payload
    const updatePayload: Record<string, unknown> = {
      name: data.name?.trim() || null,
      email: cleanEmail,
      reportingCurrency: data.reportingCurrency || "IDR",
      updatedAt: new Date(),
    };

    if (finalAvatarUrl !== undefined) {
      updatePayload.avatarUrl = finalAvatarUrl;
    }

    if (data.newPassword && data.newPassword.trim().length >= 6) {
      updatePayload.passwordHash = await hashPassword(data.newPassword);
    }

    await db.update(users).set(updatePayload).where(eq(users.id, session.userId));

    // Refresh JWT session cookie with lightweight avatar URL pointer
    const [updatedUser] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (updatedUser) {
      await createSession({
        id: updatedUser.id,
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name || null,
        avatarUrl: updatedUser.avatarUrl ? `/api/user/avatar?t=${Date.now()}` : null,
        reportingCurrency: updatedUser.reportingCurrency || "IDR",
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");

    return {
      success: true,
      message: "Profil dan foto berhasil diperbarui!",
      user: {
        name: updatedUser?.name || null,
        email: updatedUser?.email || cleanEmail,
        avatarUrl: updatedUser?.avatarUrl || null,
        reportingCurrency: updatedUser?.reportingCurrency || "IDR",
      },
    };
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    const message = err instanceof Error ? err.message : "Gagal memperbarui profil";
    return { success: false, error: message };
  }
}
