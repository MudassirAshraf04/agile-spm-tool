import request  from "supertest";
import mongoose from "mongoose";
import dotenv   from "dotenv";
import app      from "../server.js";

dotenv.config();

let token    = "";
let reqId    = "";
let storyId  = "";
let sprintId = "";
let estId    = "";

beforeAll(async () => {
  const uri = (process.env.MONGO_URI || "mongodb://localhost:27017/agilecase")
    .replace(/\/agilecase.*$/, "/agilecase_test");
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("AUTH", () => {
  test("POST /api/auth/register — creates a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@agilecase.com", password: "password123", role: "scrum_master",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  test("POST /api/auth/register — rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User 2", email: "test@agilecase.com", password: "password123",
    });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/login — returns token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "test@agilecase.com", password: "password123" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /api/auth/login — rejects wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "test@agilecase.com", password: "wrongpassword" });
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/auth/me — returns current user", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@agilecase.com");
  });

  test("GET /api/auth/me — rejects no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});

describe("USERS", () => {
  test("GET /api/users — returns user list without passwords", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).not.toHaveProperty("password");
  });

  test("GET /api/users — rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
  });
});

describe("REQUIREMENTS", () => {
  test("POST /api/requirements — creates a requirement", async () => {
    const res = await request(app).post("/api/requirements").set("Authorization", `Bearer ${token}`)
      .send({ title: "User Authentication", description: "Secure login", priority: "High", category: "Functional", stakeholder: "PM" });
    expect(res.statusCode).toBe(201);
    expect(res.body.reqId).toBe("REQ-1");
    reqId = res.body._id;
  });

  test("GET /api/requirements — returns all", async () => {
    const res = await request(app).get("/api/requirements").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /api/requirements?priority=High — filters", async () => {
    const res = await request(app).get("/api/requirements?priority=High").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    res.body.forEach((r) => expect(r.priority).toBe("High"));
  });

  test("GET /api/requirements/:id — single", async () => {
    const res = await request(app).get(`/api/requirements/${reqId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("User Authentication");
  });

  test("PUT /api/requirements/:id — updates", async () => {
    const res = await request(app).put(`/api/requirements/${reqId}`).set("Authorization", `Bearer ${token}`).send({ priority: "Medium" });
    expect(res.statusCode).toBe(200);
    expect(res.body.priority).toBe("Medium");
  });
});

describe("STORIES", () => {
  test("POST /api/stories — creates a story", async () => {
    const res = await request(app).post("/api/stories").set("Authorization", `Bearer ${token}`)
      .send({ requirement: reqId, asA: "registered user", iWant: "log in with Google", soThat: "no password needed", acceptance: "Given...", points: 5, priority: "High" });
    expect(res.statusCode).toBe(201);
    expect(res.body.storyId).toBe("US-1");
    storyId = res.body._id;
  });

  test("GET /api/stories — returns all", async () => {
    const res = await request(app).get("/api/stories").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("PATCH /api/stories/:id/status — updates status", async () => {
    const res = await request(app).patch(`/api/stories/${storyId}/status`).set("Authorization", `Bearer ${token}`).send({ status: "In Progress" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("In Progress");
  });

  test("PATCH /api/stories/:id/status — rejects invalid status", async () => {
    const res = await request(app).patch(`/api/stories/${storyId}/status`).set("Authorization", `Bearer ${token}`).send({ status: "Flying" });
    expect(res.statusCode).toBe(400);
  });

  test("PATCH /api/stories/:id/assignee — assigns a user", async () => {
    const usersRes = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);
    const userId   = usersRes.body[0]._id;
    const res = await request(app).patch(`/api/stories/${storyId}/assignee`).set("Authorization", `Bearer ${token}`).send({ assignee: userId });
    expect(res.statusCode).toBe(200);
    expect(res.body.assignee._id).toBe(userId);
  });

  test("PUT /api/stories/:id — updates points", async () => {
    const res = await request(app).put(`/api/stories/${storyId}`).set("Authorization", `Bearer ${token}`).send({ points: 8 });
    expect(res.statusCode).toBe(200);
    expect(res.body.points).toBe(8);
  });
});

describe("SPRINTS", () => {
  test("POST /api/sprints — creates a sprint", async () => {
    const res = await request(app).post("/api/sprints").set("Authorization", `Bearer ${token}`)
      .send({ name: "Sprint 1", startDate: "2025-07-01", endDate: "2025-07-14", goal: "Auth flow", capacity: 32 });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Sprint 1");
    sprintId = res.body._id;
  });

  test("POST /api/sprints — rejects bad date range", async () => {
    const res = await request(app).post("/api/sprints").set("Authorization", `Bearer ${token}`)
      .send({ name: "Bad", startDate: "2025-07-14", endDate: "2025-07-01", capacity: 32 });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/sprints/:id/stories — adds story", async () => {
    const res = await request(app).post(`/api/sprints/${sprintId}/stories`).set("Authorization", `Bearer ${token}`).send({ storyId });
    expect(res.statusCode).toBe(200);
  });

  test("GET /api/sprints/:id/stats — returns stats", async () => {
    const res = await request(app).get(`/api/sprints/${sprintId}/stats`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalPoints");
    expect(res.body).toHaveProperty("byStatus");
  });

  test("PUT /api/sprints/:id — activates sprint", async () => {
    const res = await request(app).put(`/api/sprints/${sprintId}`).set("Authorization", `Bearer ${token}`).send({ status: "Active" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("Active");
  });

  test("DELETE /api/sprints/:id/stories/:storyId — removes story", async () => {
    const res = await request(app).delete(`/api/sprints/${sprintId}/stories/${storyId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test("Story reverts to Backlog after sprint removal", async () => {
    const res = await request(app).get(`/api/stories/${storyId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("Backlog");
    expect(res.body.sprint).toBeNull();
  });
});

describe("ESTIMATIONS", () => {
  test("POST /api/estimations — PERT estimation", async () => {
    const res = await request(app).post("/api/estimations").set("Authorization", `Bearer ${token}`)
      .send({ story: storyId, method: "pert", result: 6, details: { optimistic: 4, mostLikely: 6, pessimistic: 10 } });
    expect(res.statusCode).toBe(201);
    expect(res.body.result).toBe(6);
    estId = res.body._id;
  });

  test("POST /api/estimations — Planning Poker", async () => {
    const res = await request(app).post("/api/estimations").set("Authorization", `Bearer ${token}`)
      .send({ method: "planning_poker", result: 5, details: { votes: [3, 5, 5, 8], consensus: 5 } });
    expect(res.statusCode).toBe(201);
  });

  test("GET /api/estimations — returns history", async () => {
    const res = await request(app).get("/api/estimations").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("DELETE /api/estimations/:id — deletes", async () => {
    const res = await request(app).delete(`/api/estimations/${estId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("CLEANUP", () => {
  test("DELETE /api/stories/:id", async () => {
    const res = await request(app).delete(`/api/stories/${storyId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test("DELETE /api/requirements/:id", async () => {
    const res = await request(app).delete(`/api/requirements/${reqId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test("DELETE /api/sprints/:id", async () => {
    const res = await request(app).delete(`/api/sprints/${sprintId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});