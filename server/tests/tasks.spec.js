import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";

let mongoServer;
let token;
let userId;
let createdTaskId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);

  await request(app).post("/api/auth/register").send({ name: "T", email: "t@test.com", password: "12345678" });
  const login = await request(app).post("/api/auth/login").send({ email: "t@test.com", password: "12345678" });
  token = login.body.accessToken || login.body.token || login.body.accessToken;
  const user = await User.findOne({ email: "t@test.com" });
  userId = user._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Tasks API CRUD", () => {
  it("Crear tarea POST /api/tasks", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Task", description: "desc" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("title", "Test Task");
    createdTaskId = res.body.id || res.body._id;
  });

  it("Listar tareas GET /api/tasks incluye la creada", async () => {
    const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t) => (t.id || t._id || t.title) === "Test Task" || t.title === "Test Task" )).toBeTruthy();
  });

  it("Actualizar tarea PUT /api/tasks/:id", async () => {
    const id = createdTaskId;
    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("completed", true);
  });

  it("Eliminar tarea (solo admin) DELETE /api/tasks/:id devuelve 403 para user", async () => {
    const id = createdTaskId;
    const res = await request(app)
      .delete(`/api/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect([403,404]).toContain(res.status);
  });

  it("Crear tarea sin título devuelve 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "   " });

    expect(res.status).toBe(400);
  });
});
