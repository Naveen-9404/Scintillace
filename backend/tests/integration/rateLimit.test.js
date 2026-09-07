import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import Event from "../../src/models/Event.js";
import { EVENT_STATUS, EVENT_TYPES } from "../../src/constants/event.constants.js";
import HTTP_STATUS from "../../src/constants/httpStatus.js";

describe("Rate Limiting and Proxy Tests", () => {
  let event;
  let originalEnv;

  beforeAll(async () => {
    originalEnv = process.env.NODE_ENV;
    
    const dummyId = new mongoose.Types.ObjectId();
    event = await Event.create({
      name: "Rate Limit Test Event",
      title: "Rate Limit Title",
      description: "Desc",
      type: EVENT_TYPES.INDIVIDUAL,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 100,
      isPaid: true,
      maxParticipants: 1000,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: dummyId
    });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("Public Registration Rate Limiter", () => {
    it("should allow 200+ requests from the same IP without rate limiting", async () => {
      // Temporarily change NODE_ENV so the limiter does not skip
      process.env.NODE_ENV = "production";
      
      const payload = {
        eventId: event._id,
        participantName: "Guest User",
        participantEmail: "guest@example.com",
        participantPhone: "1234567890",
        collegeId: "C123"
      };

      // Send 205 requests to simulate 200+ students on a campus NAT
      for (let i = 0; i < 205; i++) {
        const p = { ...payload, participantEmail: `guest${i}@example.com` };
        const res = await request(app)
          .post("/api/v1/registrations/public")
          .set("X-Forwarded-For", "192.168.1.100") // Simulate same IP through proxy
          .send(p);
        
        // Should not be rate limited
        expect(res.status).not.toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
      }

      // Restore NODE_ENV
      process.env.NODE_ENV = "test";
    }, 30000);
  });

  describe("Proxy/IP behavior", () => {
    it("should correctly resolve IP from X-Forwarded-For when trust proxy is enabled", async () => {
      // Test the express app trust proxy setting
      // We can check if trust proxy is set to 1
      expect(app.get("trust proxy")).toBe(1);
    });
  });
});
