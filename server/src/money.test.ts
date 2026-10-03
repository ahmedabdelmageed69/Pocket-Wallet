import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// Unit tests run without a database; integration tests would use a test Postgres.
vi.mock("./lib/prisma", () => ({ prisma: {} }));
import { createApp } from "./app";
import { toCents } from "./lib/money";

describe("toCents", () => {
  it("converts decimal strings to integer cents", () => {
    expect(toCents("12.5")).toBe(1250);
    expect(toCents("0.01")).toBe(1);
    expect(toCents(100)).toBe(10000);
  });

  it("rejects bad or unsafe amounts", () => {
    expect(() => toCents("-5")).toThrow();
    expect(() => toCents("1.234")).toThrow();
    expect(() => toCents("0")).toThrow();
    expect(() => toCents("abc")).toThrow();
    expect(() => toCents("20000")).toThrow();
  });
});

describe("auth guard", () => {
  it("blocks wallet routes without a token", async () => {
    const res = await request(createApp()).get("/wallet");
    expect(res.status).toBe(401);
  });

  it("answers health checks", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.body).toEqual({ ok: true });
  });
});
