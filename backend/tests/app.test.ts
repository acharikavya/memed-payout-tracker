import request from "supertest";
import app from "../src/app";

describe("API health check", () => {
  it("returns 200 when the API is running", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "Meme'd Payout Tracker API is running",
    });
  });

  it("returns 404 for an unknown endpoint", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
  });

  it("rejects signup with an invalid role", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "invalid-role@example.com",
        password: "TestPassword123!",
        role: "admin",
      });

    expect(response.status).toBe(400);
  });
});