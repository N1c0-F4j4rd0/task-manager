import { describe, it, expect } from "vitest";

function isOverdueLike(dueDate: string | undefined, done: boolean) {
  if (done) return false;
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

describe("isOverdue like util", () => {
  it("marca vencida si fecha pasada y no completada", () => {
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0,10);
    expect(isOverdueLike(yesterday, false)).toBe(true);
    expect(isOverdueLike(yesterday, true)).toBe(false);
  });
});
