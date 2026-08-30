import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/User.js";

describe("Auth Integration Tests", () => {
  const validRegisterData = {
    fullName: "John Doe",
    email: "john@example.com",
    password: "Password@123",
    phone: "1234567890",
    collegeId: "TEST-123",
    college: "Test College",
    course: "BTech",
    year: "3rd Year",
    gender: "Male",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validRegisterData)
        .expect(200); /* Or 200 */;
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validRegisterData.email);
    });

    it("should reject duplicate email", async () => {
      await request(app).post("/api/v1/auth/register").send(validRegisterData);
      
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validRegisterData)
        .expect(409); // Conflict or 400 based on validation
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(validRegisterData);
    });

    it("should login successfully with valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: validRegisterData.email,
          password: validRegisterData.password,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined(); // Refresh token
    });

    it("should reject invalid password", async () => {
      await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: validRegisterData.email,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });
});
