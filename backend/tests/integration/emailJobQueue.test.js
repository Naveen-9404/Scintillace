import { jest } from "@jest/globals";
import "../setup.js";

// Mock the utilities
jest.unstable_mockModule("../../src/utils/email.js", () => ({
  default: {
    sendRegistrationConfirmation: jest.fn().mockResolvedValue({ messageId: "MOCK_ID" }),
  }
}));

jest.unstable_mockModule("../../src/utils/receipt.js", () => ({
  default: {
    generateRegistrationPDF: jest.fn().mockResolvedValue(Buffer.from("PDF")),
  }
}));

const { default: emailUtil } = await import("../../src/utils/email.js");
const { default: receiptUtil } = await import("../../src/utils/receipt.js");
const { default: mongoose } = await import("mongoose");
const { default: request } = await import("supertest");
const { default: app } = await import("../../src/app.js");
const { default: Registration } = await import("../../src/models/Registration.js");
const { default: Payment } = await import("../../src/models/Payment.js");
const { default: Ticket } = await import("../../src/models/Ticket.js");
const { default: EmailJob } = await import("../../src/models/EmailJob.js");
const { default: Event } = await import("../../src/models/Event.js");
const { default: User } = await import("../../src/models/User.js");
const { default: Team } = await import("../../src/models/team.model.js");
const { default: Festival } = await import("../../src/models/Festival.js");
const { default: emailWorker } = await import("../../src/workers/email.worker.js");
const { default: jwt } = await import("jsonwebtoken");


const generateAdminToken = (userId) => {
  return jwt.sign({ sub: userId, role: "SUPER_ADMIN" }, process.env.ACCESS_TOKEN_SECRET || "test", { expiresIn: "1h" });
};

describe("Email Job Queue Integration Tests", () => {
  let admin, user1, user2, eventIndividual, eventTeam, festival, team;
  let adminToken;

  beforeEach(async () => {
    jest.clearAllMocks();

    admin = await User.create({
      fullName: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "SUPER_ADMIN",
      phone: "1234567890",
      college: "Test",
      collegeId: `TEST-${Date.now()}-1`,
      course: "BTech",
      year: "3rd Year",
      gender: "Male",
    });
    adminToken = generateAdminToken(admin._id);

    festival = await Festival.create({
      title: "Test Fest",
      description: "Test description",
      venue: "Test Venue",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      status: "PUBLISHED",
      createdBy: admin._id,
    });

    user1 = await User.create({
      fullName: "User One",
      email: "user1@test.com",
      password: "password123",
      role: "STUDENT",
      phone: "1234567890",
      college: "Test",
      collegeId: `TEST-${Date.now()}-2`,
      course: "BTech",
      year: "3rd Year",
      gender: "Male",
    });

    user2 = await User.create({
      fullName: "User Two",
      email: "user2@test.com",
      password: "password123",
      role: "STUDENT",
      phone: "1234567890",
      college: "Test",
      collegeId: `TEST-${Date.now()}-3`,
      course: "BTech",
      year: "3rd Year",
      gender: "Male",
    });

    eventIndividual = await Event.create({
      title: "Solo Event",
      description: "Solo event description",
      festival: festival._id,
      category: "TECHNICAL",
      type: "INDIVIDUAL",
      registrationFee: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "PUBLISHED",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600000),
      createdBy: admin._id,
    });

    eventTeam = await Event.create({
      title: "Team Event",
      description: "Team event description",
      festival: festival._id,
      category: "TECHNICAL",
      type: "TEAM",
      registrationFee: 200,
      minTeamSize: 2,
      maxTeamSize: 2,
      status: "PUBLISHED",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600000),
      createdBy: admin._id,
    });

    team = await Team.create({
      teamName: "Test Team",
      inviteCode: "TEST12",
      event: eventTeam._id,
      festival: festival._id,
      leader: user1._id,
      members: [
        { _id: user1._id, user: user1._id, participantEmail: user1.email, participantName: user1.fullName, status: "JOINED" },
        { _id: user2._id, user: user2._id, participantEmail: user2.email, participantName: user2.fullName, status: "JOINED" },
      ],
      status: "FULL",
      maxMembers: 2,
    });
  });

  const createPendingRegistration = async (user, event, teamRef = null) => {
    const reg = await Registration.create({
      user: user._id,
      event: event._id,
      team: teamRef ? teamRef._id : null,
      festival: festival._id,
      status: "PENDING",
      paymentStatus: "PENDING",
      participantName: user.fullName,
      participantEmail: user.email,
    });

    const pay = await Payment.create({
      user: user._id,
      registration: reg._id,
      paymentFor: "EVENT",
      amount: event.registrationFee,
      currency: "INR",
      status: "PENDING",
      paymentId: "OFFLINE",
      orderId: `ORDER_${Date.now()}`,
    });

    return { reg, pay };
  };

  test("Approval creates PAID payment, REGISTERED registration, Ticket, and EmailJob without calling SMTP synchronously", async () => {
    const { reg, pay } = await createPendingRegistration(user1, eventIndividual);

    const res = await request(app)
      .post(`/api/v1/registrations/${reg._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ manualVerification: true });

    expect(res.status).toBe(200);

    const updatedReg = await Registration.findById(reg._id);
    expect(updatedReg.status).toBe("REGISTERED");
    expect(updatedReg.paymentStatus).toBe("PAID");

    const updatedPay = await Payment.findById(pay._id);
    expect(updatedPay.status).toBe("PAID");

    const tickets = await Ticket.find({ registration: reg._id });
    expect(tickets.length).toBe(1);

    const jobs = await EmailJob.find({ registration: reg._id });
    expect(jobs.length).toBe(1);
    expect(jobs[0].status).toBe("PENDING");
    expect(jobs[0].recipientEmail).toBe(user1.email);

    // Verify SMTP was NOT called synchronously
    expect(emailUtil.sendRegistrationConfirmation).not.toHaveBeenCalled();
  });

  test("Team registration creates multiple EmailJobs", async () => {
    const { reg } = await createPendingRegistration(user1, eventTeam, team);

    await request(app)
      .post(`/api/v1/registrations/${reg._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ manualVerification: true });

    const jobs = await EmailJob.find({ registration: reg._id });
    expect(jobs.length).toBe(2);
  });

  test("Worker processes PENDING job successfully and marks SENT", async () => {
    const { reg } = await createPendingRegistration(user1, eventIndividual);
    
    // Trigger approval
    await request(app)
      .post(`/api/v1/registrations/${reg._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ manualVerification: true });

    // Stop worker loop if started automatically, we will call logic manually
    // emailWorker.processNextJobSafe is not exported, but we can call it if we extract it,
    // or we can test using emailWorker.start then wait. 
    // Wait, let's just trigger the interval manually or we can call claimJobAtomically in test.
    // Instead of messing with internals, let's mock timers or just call the repository and utils directly to simulate the worker?
    // The worker is black-boxed. Let's just run `processNextJobSafe` by awaiting a small timeout if it's running.
    emailWorker.start(100);
    
    await new Promise(r => setTimeout(r, 500));
    
    emailWorker.stop();

    const jobs = await EmailJob.find({ registration: reg._id });
    expect(jobs[0].status).toBe("SENT");
    
    expect(receiptUtil.generateRegistrationPDF).toHaveBeenCalled();
    expect(emailUtil.sendRegistrationConfirmation).toHaveBeenCalled();
  });

  test("Duplicate approval does not create duplicate EmailJobs (unique index)", async () => {
    const { reg } = await createPendingRegistration(user1, eventIndividual);

    await request(app)
      .post(`/api/v1/registrations/${reg._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ manualVerification: true });

    await request(app)
      .post(`/api/v1/registrations/${reg._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ manualVerification: true });

    const jobs = await EmailJob.find({ registration: reg._id });
    expect(jobs.length).toBe(1);
  });

});
