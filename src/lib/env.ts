import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().default("postgresql://user:pass@localhost:5432/neondb"),
  AUTH_SECRET: z.string().min(16).default("dev-auth-secret-must-be-changed-in-production-32chars"),
  DEFAULT_CURRENCY: z.string().default("IDR"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
  NODE_ENV: process.env.NODE_ENV,
});

export type Env = z.infer<typeof envSchema>;
