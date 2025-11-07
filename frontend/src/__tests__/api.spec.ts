import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "../services/api";

const mockTask = { id: "1", title: "T", description: "", completed: false, priority: "Media" };

describe("API service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list() retorna array cuando fetch ok", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTask],
    });

    const rows = await api.list();
    expect(Array.isArray(rows)).toBeTruthy();
    expect(rows[0]).toHaveProperty("id", "1");
  });

  it("create() lanza error si res.ok false", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false, text: async () => "err" });
    await expect(api.create(mockTask as any)).rejects.toThrow();
  });

  it("remove() no retorna nada si ok", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });
    await expect(api.remove("1")).resolves.toBeUndefined();
  });
});
