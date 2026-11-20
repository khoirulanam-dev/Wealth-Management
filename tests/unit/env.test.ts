import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Environment Validation", () => {
  const testSchema = z.object({
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(16),
    DEFAULT_CURRENCY: z.string().default("IDR"),
  });

  it("validates valid environment configuration successfully", () => {
    const validConfig = {
      DATABASE_URL: "postgresql://user:pass@ep-cool-sample.us-east-2.aws.neon.tech/neondb",
      AUTH_SECRET: "this-is-a-valid-secure-secret-key-32chars",
      DEFAULT_CURRENCY: "IDR",
    };
    const parsed = testSchema.parse(validConfig);
    expect(parsed.DEFAULT_CURRENCY).toBe("IDR");
  });

  it("fails safely when required DATABASE_URL is malformed or missing", () => {
    const invalidConfig = {
      DATABASE_URL: "not-a-valid-url",
      AUTH_SECRET: "short",
    };
    expect(() => testSchema.parse(invalidConfig)).toThrow();
  });
});

