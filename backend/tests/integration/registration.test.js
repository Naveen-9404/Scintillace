import { jest } from '@jest/globals';

jest.unstable_mockModule("../../src/utils/email.js", () => ({
  default: {
    sendRegistrationConfirmation: jest.fn().mockResolvedValue(true),
    sendAccommodationConfirmation: jest.fn().mockResolvedValue(true),
    sendCertificateEmail: jest.fn().mockResolvedValue(true),
  }
}));

jest.unstable_mockModule("../../src/utils/cloudinary.js", () => ({
  default: {
    deleteAsset: jest.fn().mockResolvedValue(true),
  }
}));

jest.unstable_mockModule("../../src/services/certificatePdf.service.js", () => ({
  default: {
    generateCertificatePdf: jest.fn().mockResolvedValue(Buffer.from("dummy-pdf-content")),
  }
}));

const { default: mongoose } = await import("mongoose");
const { default: request } = await import("supertest");
const { default: app } = await import("../../src/app.js");
const { default: User } = await import("../../src/models/User.js");
const { default: Event } = await import("../../src/models/Event.js");
const { default: Festival } = await import("../../src/models/Festival.js");

describe("Registration Integration Tests", () => {
  let user1Token, user1Id;
  let user2Token, user2Id;
  let eventId;
  let festivalId;

  const registerUser = async (email) => {
    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Test User",
      email,
      password: "Password@123",
      phone: "1234567890",
      college: "Test",
      collegeId: `TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      course: "BTech",
      year: "3rd Year",
      gender: "Male",
    });
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "Password@123" });
    if (!login.body.data) {
      console.log("REGISTER FAILED:", res.body);
      console.log("LOGIN FAILED:", login.body);
    }
    return { token: login.body.data.accessToken, id: res.body.data.user._id };
  };

  beforeEach(async () => {
    const user1 = await registerUser("reg1@example.com");
    user1Token = user1.token;
    user1Id = user1.id;

    const user2 = await registerUser("reg2@example.com");
    user2Token = user2.token;
    user2Id = user2.id;

    const festival = await Festival.create({
      title: "Scintillace 2K26",
      status: "PUBLISHED",
      createdBy: user1Id,
      description: "Test description",
      venue: "Main Stage",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      registration: { open: true },
    });
    festivalId = festival._id;

    const event = await Event.create({
      title: "Test Event",
      festival: festivalId,
      category: "TECHNICAL",
      type: "INDIVIDUAL",
      status: "PUBLISHED",
      registrationMode: "FREE",
      isPaid: false,
      registrationRequired: true,
      registrationOpen: true,
      maxParticipants: 10,
      createdBy: user1Id,
      description: "Test description",
      venue: "Main Stage",
      startDateTime: new Date(Date.now() + 86400000),
      endDateTime: new Date(Date.now() + 86400000 * 2),
    });
    eventId = event._id;
  });

  describe("Free Event Registration", () => {
    it("should allow a user to register for a free event", async () => {
      const res = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          event: eventId.toString(),
          participantName: "User One",
          participantEmail: "user1@example.com",
          participantPhone: "9876543210",
          collegeId: new mongoose.Types.ObjectId().toHexString(),
          course: "B.Tech",
          year: "3",
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registration.status).toBe("REGISTERED");
    });

    it("should prevent duplicate registration", async () => {
      const payload = {
        event: eventId.toString(),
        participantName: "User One",
        participantEmail: "user1@example.com",
        participantPhone: "9876543210",
        collegeId: new mongoose.Types.ObjectId().toHexString(),
        course: "B.Tech",
        year: "3",
      };

      await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send(payload)
        .expect(201);
      
      await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send(payload)
        .expect(409);
    });

    it("should allow unlimited registrations concurrently if maxParticipants is null", async () => {
      // Create an unlimited event
      const unlimitedEvent = await Event.create({
        title: "Test Unlimited Event",
        festival: festivalId,
        category: "TECHNICAL",
        type: "INDIVIDUAL",
        status: "PUBLISHED",
        registrationMode: "FREE",
        isPaid: false,
        registrationRequired: true,
        registrationOpen: true,
        maxParticipants: null, // Unlimited
        createdBy: user1Id,
        description: "Test description",
        venue: "Main Stage",
        startDateTime: new Date(Date.now() + 86400000),
        endDateTime: new Date(Date.now() + 86400000 * 2),
      });

      const users = [];
      for (let i = 0; i < 15; i++) {
        const u = await registerUser(`conc_unlimited${i}@example.com`);
        users.push(u);
      }

      const reqs = users.map((u) => 
        request(app)
          .post(`/api/v1/registrations`)
          .set("Authorization", `Bearer ${u.token}`)
          .send({
            event: unlimitedEvent._id.toString(),
            participantName: "Concurrency User Unlimited",
            participantEmail: "conc_unlimited@example.com",
            participantPhone: "9876543210",
            collegeId: new mongoose.Types.ObjectId().toHexString(),
            course: "B.Tech",
            year: "1",
          })
      );
      
      const responses = await Promise.all(reqs);
      
      const successful = responses.filter(r => r.status === 201);
      const failed = responses.filter(r => r.status !== 201);
      
      expect(successful.length).toBe(15);
      expect(failed.length).toBe(0);
    }, 30000);
  });

  describe("Paid Event Registration", () => {
    let paidEventId;

    beforeEach(async () => {
      const paidEvent = await Event.create({
        title: "Test Paid Event",
        festival: festivalId,
        category: "TECHNICAL",
        type: "INDIVIDUAL",
        status: "PUBLISHED",
        registrationMode: "PAID",
        isPaid: true,
        registrationFee: 100,
        currency: "INR",
        registrationRequired: true,
        registrationOpen: true,
        maxParticipants: 10,
        createdBy: user1Id,
        description: "Test description",
        venue: "Main Stage",
        startDateTime: new Date(Date.now() + 86400000),
        endDateTime: new Date(Date.now() + 86400000 * 2),
      });
      paidEventId = paidEvent._id;
    });

    it("should fail to register if screenshot is not provided", async () => {
      const res = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          event: paidEventId.toString(),
          participantName: "User One",
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Payment screenshot is required");
    });

    it("should successfully create pending registration and payment if screenshot is provided", async () => {
      const res = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          event: paidEventId.toString(),
          participantName: "User One",
          screenshotUrl: "https://example.com/screenshot.png",
          screenshotPublicId: "screenshot_123",
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentRequired).toBe(true);
      expect(res.body.data.registration.status).toBe("PENDING");
      expect(res.body.data.registration.paymentStatus).toBe("PENDING");
    });
  });

  describe("Admin Verification Flow", () => {
    let paidEventId, pendingRegId, adminToken;

    beforeEach(async () => {
      // Create admin
      const adminReg = await registerUser("admin@example.com");
      await User.findByIdAndUpdate(adminReg.id, { role: "SUPER_ADMIN" });
      adminToken = adminReg.token;

      // Create paid event
      const paidEvent = await Event.create({
        title: "Test Paid Event Admin",
        festival: festivalId,
        category: "TECHNICAL",
        type: "INDIVIDUAL",
        status: "PUBLISHED",
        registrationMode: "PAID",
        isPaid: true,
        registrationFee: 100,
        currency: "INR",
        registrationRequired: true,
        registrationOpen: true,
        maxParticipants: 10,
        createdBy: user1Id,
        description: "Test description",
        venue: "Main Stage",
        startDateTime: new Date(Date.now() + 86400000),
        endDateTime: new Date(Date.now() + 86400000 * 2),
      });
      paidEventId = paidEvent._id;

      // Create pending registration
      const regRes = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          event: paidEventId.toString(),
          participantName: "User One",
          screenshotUrl: "https://example.com/screenshot.png",
          screenshotPublicId: "screenshot_123",
        });
      pendingRegId = regRes.body.data.registration._id;
    });

    it("should allow admin to retrieve pending registrations", async () => {
      const res = await request(app)
        .get(`/api/v1/registrations?status=PENDING`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.registrations.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.registrations[0].status).toBe("PENDING");
    });

    it("should allow admin to retrieve payment screenshot", async () => {
      const res = await request(app)
        .get(`/api/v1/registrations/${pendingRegId}/payment`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.payment.screenshotUrl).toBe("https://example.com/screenshot.png");
    });

    it("should prevent normal participant from fetching payment screenshot", async () => {
      // Normal participant calling admin endpoint (unless it's their own payment? Wait, getPaymentByRegistration currently checks SUPER_ADMIN / FACULTY in routes)
      const res = await request(app)
        .get(`/api/v1/registrations/${pendingRegId}/payment`)
        .set("Authorization", `Bearer ${user1Token}`);
      expect(res.status).toBe(403);
    });

    it("should allow admin to approve registration", async () => {
      const res = await request(app)
        .post(`/api/v1/registrations/${pendingRegId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.registration.status).toBe("REGISTERED");
      expect(res.body.data.registration.paymentStatus).toBe("PAID");

      // Verify payment DB record
      const payRes = await request(app)
        .get(`/api/v1/registrations/${pendingRegId}/payment`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(payRes.body.data.payment.status).toBe("PAID");
      expect(payRes.body.data.payment.screenshotUrl).toBeNull();
    });

    it("should allow admin to reject registration with reason", async () => {
      const res = await request(app)
        .post(`/api/v1/registrations/${pendingRegId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ rejectionReason: "Invalid screenshot" });
      
      expect(res.status).toBe(200);
      expect(res.body.data.registration.status).toBe("REJECTED");
      expect(res.body.data.registration.paymentStatus).toBe("FAILED");
      expect(res.body.data.registration.rejectionReason).toBe("Invalid screenshot");

      // Verify payment DB record
      const payRes = await request(app)
        .get(`/api/v1/registrations/${pendingRegId}/payment`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(payRes.body.data.payment.status).toBe("FAILED");
      expect(payRes.body.data.payment.screenshotUrl).toBeNull();
    });
  });
});
