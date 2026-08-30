import request from "supertest";
import app from "../../src/app.js";

describe("Authorization Integration Tests", () => {
  let studentToken;

  beforeEach(async () => {
    // Register a standard student
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Student User",
      email: "student@example.com",
      password: "Password@123",
      phone: "1234567890",
      college: "Test",
      collegeId: "TEST-123",
      course: "BTech",
      year: "3rd Year",
      gender: "Male",
    });
    
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "student@example.com", password: "Password@123" });
    
    studentToken = login.body.data.accessToken;
  });

  describe("Admin and Faculty Routes Protection", () => {
    it("should reject student access to admin dashboard", async () => {
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(403);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authorized/i);
    });

    it("should reject student access to export routes", async () => {
      const res = await request(app)
        .get("/api/v1/export/users")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe("Unauthenticated Access Protection", () => {
    it("should reject unauthenticated access to protected resources", async () => {
      await request(app)
        .get("/api/v1/auth/me")
        .expect(401);
    });
  });
});
