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
const { default: Event } = await import("../../src/models/Event.js");
const { default: Payment } = await import("../../src/models/Payment.js");
const { default: Registration } = await import("../../src/models/Registration.js");
const { EVENT_STATUS, EVENT_TYPES } = await import("../../src/constants/event.constants.js");
const { PAYMENT_STATUS } = await import("../../src/constants/registration.constants.js");
const { default: HTTP_STATUS } = await import("../../src/constants/httpStatus.js");

describe("Guest Payment Integration Tests", () => {
  let testEvent;

  beforeEach(async () => {
    const dummyId = new mongoose.Types.ObjectId();

    testEvent = await Event.create({
      name: "Guest Payment Event",
      title: "Title",
      description: "Desc",
      type: EVENT_TYPES.INDIVIDUAL,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 600,
      isPaid: true,
      maxParticipants: 100,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: dummyId
    });
  });

  it("should securely fetch registration status using guest token", async () => {
    // 1. Register publicly to get the token
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Guest User",
      participantEmail: "guest@example.com",
      participantPhone: "9999999999",
      collegeId: "C123",
      department: "CSE",
      yearOfStudy: "3"
    });

    expect(regRes.status).toBe(HTTP_STATUS.CREATED);
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    expect(guestToken).toBeDefined();

    // 2. Fetch status without token -> should fail
    const statusNoToken = await request(app).get(`/api/v1/registrations/public/${registrationId}/status`);
    expect(statusNoToken.status).toBe(HTTP_STATUS.UNAUTHORIZED);

    // 3. Fetch status with invalid token -> should fail
    const statusInvalidToken = await request(app)
      .get(`/api/v1/registrations/public/${registrationId}/status`)
      .set("X-Guest-Token", "invalid-token");
    expect(statusInvalidToken.status).toBe(HTTP_STATUS.UNAUTHORIZED);

    // 4. Fetch status with valid token -> should succeed
    const statusValidToken = await request(app)
      .get(`/api/v1/registrations/public/${registrationId}/status`)
      .set("X-Guest-Token", guestToken);
      
    expect(statusValidToken.status).toBe(HTTP_STATUS.OK);
    expect(statusValidToken.body.data.participantName).toBe("Guest User");
    expect(statusValidToken.body.data.paymentStatus).toBe(PAYMENT_STATUS.PENDING);
  });

  it("should securely submit payment screenshot using guest token", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Payer User",
      participantEmail: "payer@example.com",
      participantPhone: "9999999999",
      collegeId: "C123",
      department: "CSE",
      yearOfStudy: "3"
    });

    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    // Submit valid screenshot
    const paymentRes = await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/fake.png",
        screenshotPublicId: "fake-public-id"
      });

    expect(paymentRes.status).toBe(HTTP_STATUS.OK);
    expect(paymentRes.body.data.screenshotUrl).toBe("https://res.cloudinary.com/demo/image/upload/v1234/fake.png");

    // Verify it created a Payment document
    const paymentDoc = await Payment.findOne({ registration: registrationId });
    expect(paymentDoc).not.toBeNull();
    expect(paymentDoc.amount).toBe(600);
    expect(paymentDoc.status).toBe("PENDING");
  });

  it("should reject arbitrary non-Cloudinary screenshot URLs", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Malicious User",
      participantEmail: "malicious@example.com",
      participantPhone: "9999999999",
      collegeId: "C123",
      department: "CSE",
      yearOfStudy: "3"
    });

    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    const paymentRes = await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://evil.com/fake.png",
        screenshotPublicId: "fake-public-id"
      });

    expect(paymentRes.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
  it("should fail cross-registration token authorization", async () => {
    // Reg A
    const regResA = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "User A",
      participantEmail: "userA@example.com",
      participantPhone: "1111111111",
      collegeId: "C111",
      department: "CSE",
      yearOfStudy: "1"
    });
    const guestTokenA = regResA.body.data.guestToken;
    const registrationIdA = regResA.body.data.registration._id;

    // Reg B
    const regResB = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "User B",
      participantEmail: "userB@example.com",
      participantPhone: "2222222222",
      collegeId: "C222",
      department: "ECE",
      yearOfStudy: "2"
    });
    const guestTokenB = regResB.body.data.guestToken;
    const registrationIdB = regResB.body.data.registration._id;

    // Token A -> Reg B status (must fail)
    const statusB = await request(app)
      .get(`/api/v1/registrations/public/${registrationIdB}/status`)
      .set("X-Guest-Token", guestTokenA);
    expect(statusB.status).toBe(HTTP_STATUS.UNAUTHORIZED);

    // Token B -> Reg A screenshot (must fail)
    const payA = await request(app)
      .post(`/api/v1/payments/public/${registrationIdA}/screenshot`)
      .set("X-Guest-Token", guestTokenB)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/fake.png",
        screenshotPublicId: "fake-public-id"
      });
    expect(payA.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("should fail expired token authorization", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Expired User",
      participantEmail: "expired@example.com",
      participantPhone: "3333333333",
      collegeId: "C333",
      department: "IT",
      yearOfStudy: "3"
    });
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    // Manually set expiration to past
    await Registration.findByIdAndUpdate(registrationId, {
      guestTokenExpiresAt: new Date(Date.now() - 1000)
    });

    const statusRes = await request(app)
      .get(`/api/v1/registrations/public/${registrationId}/status`)
      .set("X-Guest-Token", guestToken);
    
    expect(statusRes.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("should securely store only the hashed token", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Hash User",
      participantEmail: "hash@example.com",
      participantPhone: "4444444444",
      collegeId: "C444",
      department: "CSE",
      yearOfStudy: "1"
    });
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    const rawDoc = await Registration.findById(registrationId).select("+guestTokenHash +guestTokenExpiresAt").lean();
    expect(rawDoc.guestTokenHash).toBeDefined();
    expect(rawDoc.guestTokenExpiresAt).toBeDefined();
    // Ensure raw token is not in the db document
    expect(rawDoc.guestToken).toBeUndefined();
    expect(rawDoc.guestTokenHash).not.toBe(guestToken);
  });

  it("should reject screenshot modification for terminal payments", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Terminal User",
      participantEmail: "terminal@example.com",
      participantPhone: "5555555555",
      collegeId: "C555",
      department: "EEE",
      yearOfStudy: "4"
    });
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    // 1. Submit first screenshot to create PENDING payment
    await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/fake.png",
        screenshotPublicId: "fake-public-id"
      });

    // 2. Mock payment state to PAID
    await Payment.updateOne(
      { registration: registrationId },
      { $set: { status: PAYMENT_STATUS.PAID } }
    );
    await Registration.updateOne(
      { _id: registrationId }, 
      { $set: { paymentStatus: PAYMENT_STATUS.PAID } }
    );

    // 3. Try to update screenshot again
    const updateRes = await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/new-fake.png",
        screenshotPublicId: "new-fake-public-id"
      });
    
    // Should fail because status is APPROVED
    expect(updateRes.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should prevent client from manipulating the payment amount", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Hacker User",
      participantEmail: "hack@example.com",
      participantPhone: "6666666666",
      collegeId: "C666",
      department: "CSE",
      yearOfStudy: "2"
    });
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/fake.png",
        screenshotPublicId: "fake-public-id",
        amount: 1, // Malicious
        registrationFee: 1,
        price: 1
      });

    const paymentDoc = await Payment.findOne({ registration: registrationId });
    // Should strictly be the event's registrationFee
    expect(paymentDoc.amount).toBe(600);
  });

  it("should replace screenshot while still PENDING", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Replace User",
      participantEmail: "replace@example.com",
      participantPhone: "7777777777",
      collegeId: "C777",
      department: "CSE",
      yearOfStudy: "3"
    });
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/old.png",
        screenshotPublicId: "old-public-id"
      });

    const replaceRes = await request(app)
      .post(`/api/v1/payments/public/${registrationId}/screenshot`)
      .set("X-Guest-Token", guestToken)
      .send({
        screenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1234/new.png",
        screenshotPublicId: "new-public-id"
      });
      
    expect(replaceRes.status).toBe(HTTP_STATUS.OK);

    const paymentDoc = await Payment.findOne({ registration: registrationId });
    expect(paymentDoc.screenshotUrl).toBe("https://res.cloudinary.com/demo/image/upload/v1234/new.png");
    expect(paymentDoc.screenshotPublicId).toBe("new-public-id");
  });

  it("should not expose sensitive info in status response", async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: testEvent._id,
      participantName: "Safe User",
      participantEmail: "safe@example.com",
      participantPhone: "8888888888",
      collegeId: "C888",
      department: "MECH",
      yearOfStudy: "4"
    });
    const guestToken = regRes.body.data.guestToken;
    const registrationId = regRes.body.data.registration._id;

    const statusRes = await request(app)
      .get(`/api/v1/registrations/public/${registrationId}/status`)
      .set("X-Guest-Token", guestToken);
      
    expect(statusRes.status).toBe(HTTP_STATUS.OK);
    const data = statusRes.body.data;
    // Check missing sensitive fields
    expect(data.guestToken).toBeUndefined();
    expect(data.guestTokenHash).toBeUndefined();
    expect(data.password).toBeUndefined();
  });

  it("should enforce admin authorization regression", async () => {
    // Unauthorized access to payments endpoint
    const res = await request(app).get("/api/v1/payments");
    // Depending on the exact middleware, this usually returns 401
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
