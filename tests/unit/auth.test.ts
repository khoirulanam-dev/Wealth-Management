import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("Private Authentication & Password Hashing", () => {
  it("hashes password with bcrypt and verifies correct passphrase", async () => {
    const rawPassword = "SuperSecurePassword2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123!", hash);
    expect(isWrongMatch).toBe(false);
  });
});

