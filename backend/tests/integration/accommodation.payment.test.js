import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Event from "../../src/models/Event.js";
import Festival from "../../src/models/Festival.js";
import Payment from "../../src/models/Payment.js";
import Accommodation from "../../src/models/accommodation.model.js";
import Registration from "../../src/models/Registration.js";

describe("Accommodation Payment Integration Tests (Manual UPI Architecture)", () => {
  let userToken, userId;
  let adminToken, adminId;
  let eventId;
  let festivalId;
  let registrationId;

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
      registrationMode: "FREE",
      isPaid: false,
      registrationFee: 0,
      currency: "INR",
      registrationRequired: true,
      registrationOpen: true,
      maxParticipants: null, 
      createdBy: adminId,
      description: "Test event",
      venue: "Main Stage",
      startDateTime: new Date(Date.now() + 86400000),
      endDateTime: new Date(Date.now() + 86400000 * 2),
    });
    eventId = event._id;

    const reg = await Registration.create({
      user: userId,
      event: eventId,
      festival: festivalId,
      participantName: "Test Participant",
      status: "REGISTERED",
      paymentStatus: "NOT_REQUIRED"
    });
    registrationId = reg._id;
  });

  describe("A. Manual Payment Creation", () => {
    it("creates a PENDING accommodation booking and payment with screenshot", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingStatus).toBe("Pending");
      expect(res.body.data.paymentStatus).toBe("Pending");
      expect(res.body.data.amount).toBe(400); // 2 days * 200

      // Verify payment document in DB
      const payment = await Payment.findOne({ accommodation: res.body.data._id });
      expect(payment).toBeTruthy();
      expect(payment.status).toBe("PENDING");
      expect(payment.screenshotUrl).toBe("https://example.com/screenshot.jpg");
      expect(payment.screenshotPublicId).toBe("test_public_id");
      expect(payment.amount).toBe(400);
      expect(payment.gateway).toBe("UPI");
    });

    it("allows 15 simultaneous accommodation bookings without capacity limits", async () => {
      // 1. Create 15 distinct users
      const users = await Promise.all(
        Array.from({ length: 15 }).map((_, i) => registerUser(`user${i}_acc@example.com`))
      );

      // 2. Create 15 distinct registrations
      const regs = await Promise.all(
        users.map((u, i) =>
          Registration.create({
            user: u.id,
            event: eventId,
            festival: festivalId,
            participantName: `Test Participant ${i}`,
            status: "REGISTERED",
            paymentStatus: "NOT_REQUIRED"
          })
        )
      );

      // 3. Perform 15 simultaneous accommodation bookings
      const reqs = users.map((u, i) =>
        request(app)
          .post(`/api/v1/accommodation`)
          .set("Authorization", `Bearer ${u.token}`)
          .send({
            registrationId: regs[i]._id.toString(),
            hostelType: "BOYS",
            checkInDate: new Date().toISOString(),
            checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            screenshotUrl: `https://example.com/screenshot${i}.jpg`,
            screenshotPublicId: `test_public_id_${i}`,
          })
      );
      
      const responses = await Promise.all(reqs);
      
      const successful = responses.filter(r => r.status === 201);
      const failed = responses.filter(r => r.status !== 201);
      
      expect(successful.length).toBe(15);
      expect(failed.length).toBe(0);
    }, 30000);
  });

  describe("A.1. Date and Price Calculation", () => {
    const baseCheckIn = "2026-09-28T00:00:00Z";

    it("calculates 1 day for 28 Sep to 29 Sep (₹200)", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: baseCheckIn,
          checkOutDate: "2026-09-29T00:00:00Z",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(200);
      expect(res.body.data.accommodationDays).toBe(1);
    });

    it("calculates 2 days for 28 Sep to 30 Sep (₹400)", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: baseCheckIn,
          checkOutDate: "2026-09-30T00:00:00Z",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(400);
      expect(res.body.data.accommodationDays).toBe(2);
    });

    it("calculates 3 days for 28 Sep to 01 Oct (₹600)", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: baseCheckIn,
          checkOutDate: "2026-10-01T00:00:00Z",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(600);
      expect(res.body.data.accommodationDays).toBe(3);
    });

    it("calculates 4 days for 28 Sep to 02 Oct (₹800)", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: baseCheckIn,
          checkOutDate: "2026-10-02T00:00:00Z",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(800);
      expect(res.body.data.accommodationDays).toBe(4);
    });

    it("rejects booking if check-in and check-out are the same day", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: baseCheckIn,
          checkOutDate: baseCheckIn,
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/after check-in date|at least one day/i);
    });

    it("rejects booking if check-out is before check-in", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: baseCheckIn,
          checkOutDate: "2026-09-27T00:00:00Z",
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/after check-in date/i);
    });
  });

  describe("B. Admin Approval", () => {
    it("admin can mark accommodation payment as PAID and confirm booking", async () => {
      const bookingRes = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      const bookingId = bookingRes.body.data._id;

      const approveRes = await request(app)
        .patch(`/api/v1/accommodation/${bookingId}/payment/paid`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.success).toBe(true);
      expect(approveRes.body.data.paymentStatus).toBe("Paid");

      // Verify payment document
      const payment = await Payment.findOne({ accommodation: bookingId });
      expect(payment.status).toBe("PAID");

      // Admin can confirm
      const confirmRes = await request(app)
        .patch(`/api/v1/accommodation/${bookingId}/confirm`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.bookingStatus).toBe("Confirmed");
    });
  });

  describe("C. Admin Rejection", () => {
    it("admin can reject accommodation booking which marks payment as failed and deletes screenshot", async () => {
      const bookingRes = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: registrationId.toString(),
          hostelType: "BOYS",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          screenshotUrl: "https://example.com/screenshot.jpg",
          screenshotPublicId: "test_public_id",
        });

      const bookingId = bookingRes.body.data._id;

      const rejectRes = await request(app)
        .patch(`/api/v1/accommodation/${bookingId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Screenshot is blurry" });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.success).toBe(true);
      expect(rejectRes.body.data.bookingStatus).toBe("Rejected");
      expect(rejectRes.body.data.paymentStatus).toBe("Failed");
      expect(rejectRes.body.data.rejectionReason).toBe("Screenshot is blurry");

      // Verify payment document is updated
      const payment = await Payment.findOne({ accommodation: bookingId });
      expect(payment.status).toBe("FAILED");
      expect(payment.screenshotUrl).toBeNull();
      expect(payment.screenshotPublicId).toBeNull();
    });
  });
});
