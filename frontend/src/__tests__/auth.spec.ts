
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as auth from "../services/auth";

describe("Auth service", () => {
  beforeEach(() => {

    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("login guarda token cuando ok", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ user: { email: "a@b" }, accessToken: "tok" }),
    });

    const res = await auth.login({ email: "a@b", password: "12345678" } as any);
    expect(auth.getAccessToken()).toBe("tok");
    expect(res.user.email).toBe("a@b");
  });

  it("logout limpia token", async () => {
    auth.setAccessToken("x");
    (global.fetch as any).mockResolvedValueOnce({ ok: true });
    await auth.logout();
    expect(auth.getAccessToken()).toBeNull();
  });
});
