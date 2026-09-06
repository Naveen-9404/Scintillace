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
const { default: Payment } = await import("../../src/models/Payment.js");
const { default: Ticket } = await import("../../src/models/Ticket.js");


describe("Payment Integration Tests (Manual UPI Architecture)", () => {
  let userToken, userId;
  let adminToken, adminId;
  let eventId;
  let festivalId;

  const registerUser = async (email, role = "STUDENT") => {
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
    const uId = res.body.data.user._id;
    if (role !== "STUDENT") {
      await User.findByIdAndUpdate(uId, { role });
    }
    return { token: login.body.data.accessToken, id: uId };
  };

  beforeEach(async () => {
    const admin = await registerUser("admin@example.com", "SUPER_ADMIN");
    adminToken = admin.token;
    adminId = admin.id;

    const user = await registerUser("user@example.com");
    userToken = user.token;
    userId = user.id;

    const festival = await Festival.create({
      title: "Scintillace 2K26",
      status: "PUBLISHED",
      createdBy: adminId,
      description: "Test description",
      venue: "Main Stage",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      registration: { open: true },
    });
    festivalId = festival._id;

    const event = await Event.create({
      title: "Paid Event",
      festival: festivalId,
      category: "TECHNICAL",
      type: "INDIVIDUAL",
      status: "PUBLISHED",
      registrationMode: "PAID",
      isPaid: true,
      registrationFee: 200,
      currency: "INR",
      registrationRequired: true,
      registrationOpen: true,
      maxParticipants: null, // Ensure unlimited is allowed
      createdBy: adminId,
      description: "Test paid event",
      venue: "Main Stage",
      startDateTime: new Date(Date.now() + 86400000),
      endDateTime: new Date(Date.now() + 86400000 * 2),
    });
    eventId = event._id;
  });


  describe("A. Manual Payment Creation", () => {
    it("creates a PENDING payment and registration associated with screenshot", async () => {
      const res = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          event: eventId.toString(),
          participantName: "Test Participant",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registration.status).toBe("PENDING");
      expect(res.body.data.registration.paymentStatus).toBe("PENDING");

      // Verify payment document in DB
      const payment = await Payment.findOne({ registration: res.body.data.registration._id });
      expect(payment).toBeTruthy();
      expect(payment.status).toBe("PENDING");
      expect(payment.screenshotUrl).toBe("https://example.com/screenshot.jpg");
      expect(payment.screenshotPublicId).toBe("test_public_id");
      expect(payment.amount).toBe(200);
      expect(payment.gateway).toBe("UPI"); // No Razorpay
    });
  });

  describe("B. Unauthorized Approval", () => {
    it("ordinary participant cannot approve payment", async () => {
      // First create registration
      const regRes = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          event: eventId.toString(),
          participantName: "Test Participant",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      const regId = regRes.body.data.registration._id;

      // Try to approve with user token
      const res = await request(app)
        .post(`/api/v1/registrations/${regId}/approve`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("authorized");
    });
  });

  describe("C. Admin Approval & F. Downstream Success Flow", () => {
    it("admin can approve, changing status to PAID and triggering downstream logic", async () => {
      const regRes = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          event: eventId.toString(),
          participantName: "Test Participant",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      const regId = regRes.body.data.registration._id;

      const res = await request(app)
        .post(`/api/v1/registrations/${regId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.registration.status).toBe("REGISTERED");
      expect(res.body.data.registration.paymentStatus).toBe("PAID");

      // Verify payment DB record
      const payment = await Payment.findOne({ registration: regId });
      expect(payment.status).toBe("PAID");

      // Verify Ticket & QR Generated
      const ticket = await Ticket.findOne({ registration: regId });
      expect(ticket).toBeTruthy();
      expect(ticket.qrCodeUrl).toBeDefined();
    });
  });

  describe("D. Duplicate Approval Protection", () => {
    it("second approval is rejected safely", async () => {
      const regRes = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          event: eventId.toString(),
          participantName: "Test Participant",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      const regId = regRes.body.data.registration._id;

      // First approval
      await request(app)
        .post(`/api/v1/registrations/${regId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      // Second approval attempt
      const res = await request(app)
        .post(`/api/v1/registrations/${regId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Registration is not in PENDING status");
    });
  });

  describe("E. Rejection", () => {
    it("admin can reject, setting status to REJECTED/FAILED with reason preserved", async () => {
      const regRes = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          event: eventId.toString(),
          participantName: "Test Participant",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      const regId = regRes.body.data.registration._id;

      const res = await request(app)
        .post(`/api/v1/registrations/${regId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ rejectionReason: "Invalid payment screenshot" });

      expect(res.status).toBe(200);
      expect(res.body.data.registration.status).toBe("REJECTED");
      expect(res.body.data.registration.paymentStatus).toBe("FAILED");
      expect(res.body.data.registration.rejectionReason).toBe("Invalid payment screenshot");

      // Verify payment DB record
      const payment = await Payment.findOne({ registration: regId });
      expect(payment.status).toBe("FAILED");
    });
  });

  describe("G. Business Rules & Receipt Generation", () => {
    it("no UTR or Razorpay required for payment validation", async () => {
      // The creation process required only screenshotUrl/PublicId, no Razorpay signatures
      const payment = new Payment({
        user: userId,
        registration: new mongoose.Types.ObjectId(),
        paymentFor: "EVENT",
        amount: 200,
        gateway: "UPI",
        screenshotUrl: "valid.jpg",
        screenshotPublicId: "valid_id",
        status: "PENDING",
      });

      const validationError = payment.validateSync();
      expect(validationError).toBeUndefined(); // Schema should allow this
    });

    it("can generate receipt for PAID payments", async () => {
      const regRes = await request(app)
        .post(`/api/v1/registrations`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          event: eventId.toString(),
          participantName: "Test Participant",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });
      const regId = regRes.body.data.registration._id;

      // Approve
      await request(app)
        .post(`/api/v1/registrations/${regId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      const payment = await Payment.findOne({ registration: regId });

      // Fetch receipt PDF
      const res = await request(app)
        .get(`/api/v1/payments/${payment._id}/receipt`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
    });
  });
});
