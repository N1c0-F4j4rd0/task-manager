import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";

let mongoServer;

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/task_manager_test");
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Auth - registro/login/refresh/me", () => {
  it("Registro: POST /api/auth/register crea usuario y devuelve token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "test1@example.com", password: "password123" });

    expect([200,201]).toContain(res.status);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user).toMatchObject({ email: "test1@example.com" });
  });

  it("Registro duplicado devuelve 409", async () => {
    await User.create({ name: "Dupe", email: "dupe@example.com", password: "password123" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Dupe", email: "dupe@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("Login con credenciales correctas devuelve accessToken", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Log", email: "log@example.com", password: "12345678" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "log@example.com", password: "12345678" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("Me endpoint protegido requiere token", async () => {
    const noAuth = await request(app).get("/api/auth/me");
    expect(noAuth.status).toBe(401);
  });
});
