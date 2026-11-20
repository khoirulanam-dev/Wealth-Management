import { describe, it, expect } from "vitest";
import { requireAuth } from "@/lib/auth";

describe("Server-Side Authorization Guard", () => {
  it("blocks unauthenticated access when session cookie is absent", async () => {
    // Calling requireAuth without cookies should throw UNAUTHORIZED
    await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
  });
});

