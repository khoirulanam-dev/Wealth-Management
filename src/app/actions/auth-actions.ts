"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { env } from "@/lib/env";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Check against configured private owner credentials
  if (email === env.APP_USER_EMAIL && password === env.APP_USER_PASSWORD) {
    await createSession({
      id: "owner-singleton-user",
      email: env.APP_USER_EMAIL,
      reportingCurrency: env.DEFAULT_CURRENCY,
    });
    redirect("/overview");
  }

  return { error: "Invalid credentials. Private access only." };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function checkSessionAction() {
  return await getSession();
}

