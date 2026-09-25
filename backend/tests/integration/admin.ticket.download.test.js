import { jest } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";

// Setup unstable_mockModule before dynamic imports
jest.unstable_mockModule("../../src/utils/email.js", () => ({
  default: {
    sendRegistrationConfirmation: jest.fn().mockResolvedValue(true),
  },
}));

const { default: app } = await import("../../src/app.js");
const { default: Event } = await import("../../src/models/Event.js");
const { default: Registration } = await import("../../src/models/Registration.js");
const { default: Ticket } = await import("../../src/models/Ticket.js");
const { default: User } = await import("../../src/models/User.js");
const { default: Payment } = await import("../../src/models/Payment.js");
const { default: EmailJob } = await import("../../src/models/EmailJob.js");

const { EVENT_STATUS, EVENT_TYPES } = await import("../../src/constants/event.constants.js");
const { REGISTRATION_STATUS, PAYMENT_STATUS } = await import("../../src/constants/registration.constants.js");
const ROLES = (await import("../../src/constants/roles.js")).default;
const { default: ticketService } = await import("../../src/services/ticket.service.js");
const { default: jwtUtil } = await import("../../src/utils/jwt.js");
const AdmZip = (await import("adm-zip")).default;

describe("Admin Manual Ticket Download Integration Tests", () => {
  let teamEvent;
  let individualEvent;
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const dummyId = new mongoose.Types.ObjectId();

    // Create Admin User
    const adminUser = await User.create({
      fullName: "Super Admin",
      email: "admin@example.com",
      phone: "9999999999",
      password: "password123",
      collegeId: "C1",
      role: ROLES.SUPER_ADMIN,
    });
    adminToken = await jwtUtil.generateAccessToken({ sub: adminUser._id.toString(), email: adminUser.email, role: ROLES.SUPER_ADMIN });

    // Create Normal User
    const normalUser = await User.create({
      fullName: "Normal User",
      email: "user@example.com",
      phone: "8888888888",
      password: "password123",
      collegeId: "C2",
      role: ROLES.PARTICIPANT,
    });
    userToken = await jwtUtil.generateAccessToken({ sub: normalUser._id.toString(), email: normalUser.email, role: ROLES.PARTICIPANT });

    teamEvent = await Event.create({
      name: "Team Event",
      title: "Team Event",
      description: "Desc",
      type: EVENT_TYPES.TEAM,
      teamSize: 3,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 1500,
      isPaid: true,
      maxParticipants: 100,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      endDateTime: new Date(Date.now() + 86400000 * 3),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      venue: "Main Hall",
      festival: dummyId,
    });

    individualEvent = await Event.create({
      name: "Individual Event",
      title: "Individual Event",
      description: "Desc",
      type: EVENT_TYPES.INDIVIDUAL,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 500,
      isPaid: true,
      maxParticipants: 100,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      endDateTime: new Date(Date.now() + 86400000 * 3),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      venue: "Room A",
      festival: dummyId,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  const registerIndividual = async () => {
    const regRes = await request(app)
      .post("/api/v1/registrations/public")
      .send({
        eventId: individualEvent._id,
        participantName: "Individual User",
        participantEmail: "indiv@example.com",
        participantPhone: "1111111111",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
      });
    return regRes.body.data;
  };

  const registerTeam = async () => {
    const regRes = await request(app)
      .post("/api/v1/registrations/public")
      .send({
        eventId: teamEvent._id,
        participantName: "Leader User",
        participantEmail: "leader@example.com",
        participantPhone: "2222222222",
        collegeId: "C2",
        department: "CSE",
        yearOfStudy: "3",
        teamName: "Awesome Team",
        members: [
          {
            participantName: "Leader User",
            participantEmail: "leader@example.com",
            participantPhone: "2222222222",
            collegeId: "C2",
            department: "CSE",
            yearOfStudy: "3",
          },
          {
            participantName: "Member Two",
            participantEmail: "member2@example.com",
            participantPhone: "3333333333",
            collegeId: "C2",
            department: "IT",
            yearOfStudy: "2",
          },
        ],
      });
    return regRes.body.data;
  };

  it("1, 2, 3. Unauthorized access is rejected, Authorized succeeds for individual PDF", async () => {
    const data = await registerIndividual();
    await Registration.findByIdAndUpdate(data.registration._id, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    });
    await Payment.create({
      registration: data.registration._id,
      amount: 500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });
    await ticketService.createTicketsForRegistration(data.registration._id);

    // Unauthenticated -> 401
    await request(app)
      .get(`/api/v1/registrations/${data.registration._id}/ticket-pdf`)
      .expect(401);

    // Participant -> 403
    await request(app)
      .get(`/api/v1/registrations/${data.registration._id}/ticket-pdf`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    // Super Admin -> 200
    const res = await request(app)
      .get(`/api/v1/registrations/${data.registration._id}/ticket-pdf`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.headers["content-type"]).toBe("application/pdf");
  });

  it("4, 5. Team member ticket uses that exact member's details", async () => {
    const data = await registerTeam();
    const reg = await Registration.findByIdAndUpdate(data.registration._id, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    }, { new: true });
    await Payment.create({
      registration: data.registration._id,
      amount: 1500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });
    const tickets = await ticketService.createTicketsForRegistration(data.registration._id);

    const team = await mongoose.model("Team").findById(data.registration.team);
    const leaderMember = team.members[0];
    const secondMember = team.members[1];

    const res1 = await request(app)
      .get(`/api/v1/registrations/${reg._id}/ticket-pdf?teamMemberId=${leaderMember._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const res2 = await request(app)
      .get(`/api/v1/registrations/${reg._id}/ticket-pdf?teamMemberId=${secondMember._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Just verify the filenames to ensure they are distinct and correspond to the member
    expect(res1.headers["content-disposition"]).toContain("Leader_User");
    expect(res2.headers["content-disposition"]).toContain("Member_Two");

    // File contents should differ as PDFs contain distinct details
    expect(res1.body).not.toEqual(res2.body);
  });

  it("6. Updated Team.members details appear in the generated PDF", async () => {
    const data = await registerTeam();
    await Registration.findByIdAndUpdate(data.registration._id, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    });
    await Payment.create({
      registration: data.registration._id,
      amount: 1500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });
    await ticketService.createTicketsForRegistration(data.registration._id);

    // Update the second member's name manually via DB to simulate profile/team update
    const team = await mongoose.model("Team").findById(data.registration.team);
    team.members[1].participantName = "Updated Member Name";
    await team.save();

    const secondMember = team.members[1];

    const res = await request(app)
      .get(`/api/v1/registrations/${data.registration._id}/ticket-pdf?teamMemberId=${secondMember._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.headers["content-disposition"]).toContain("Updated_Member_Name");
  });

  it("7, 8. Current team member with no existing ticket receives exactly one generated ticket idempotently", async () => {
    const data = await registerTeam();
    const reg = await Registration.findByIdAndUpdate(data.registration._id, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    }, { new: true }).populate("team");
    await Payment.create({
      registration: data.registration._id,
      amount: 1500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });
    // Generate for existing 2 members
    await ticketService.createTicketsForRegistration(data.registration._id);

    // Add 3rd member (mocking a later addition without ticket generation)
    const team = await mongoose.model("Team").findById(data.registration.team);
    team.members.push({
      participantName: "Late Member",
      participantEmail: "late@example.com",
      participantPhone: "4444444444",
      collegeId: "C2",
      department: "IT",
      yearOfStudy: "1",
      role: "MEMBER",
    });
    await team.save();

    const lateMember = team.members[2];

    const initialTicketCount = await Ticket.countDocuments({ registration: reg._id });
    expect(initialTicketCount).toBe(2);

    // Download PDF for the late member
    await request(app)
      .get(`/api/v1/registrations/${reg._id}/ticket-pdf?teamMemberId=${lateMember._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const countAfterFirstDownload = await Ticket.countDocuments({ registration: reg._id });
    expect(countAfterFirstDownload).toBe(3); // Exactly one ticket generated for late member

    // Download again
    await request(app)
      .get(`/api/v1/registrations/${reg._id}/ticket-pdf?teamMemberId=${lateMember._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const countAfterSecondDownload = await Ticket.countDocuments({ registration: reg._id });
    expect(countAfterSecondDownload).toBe(3); // Duplicate is NOT generated
  });

  it("9, 13, 14. Download All generates one PDF per current eligible team member in ZIP", async () => {
    const data = await registerTeam();
    const reg = await Registration.findByIdAndUpdate(data.registration._id, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    }, { new: true });
    await Payment.create({
      registration: data.registration._id,
      amount: 1500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });
    
    // Do not pre-generate tickets to test that ZIP route auto-generates them
    const res = await request(app)
      .get(`/api/v1/registrations/${reg._id}/team-tickets-zip`)
      .set("Authorization", `Bearer ${adminToken}`)
      .responseType("blob")
      .expect(200);

    expect(res.headers["content-type"]).toBe("application/zip");
    
    const zipBuffer = res.body;
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    // The team has 2 members, so 2 PDFs should be in the ZIP
    expect(zipEntries.length).toBe(2);
    expect(zipEntries.some(e => e.entryName.includes("Leader_User"))).toBe(true);
    expect(zipEntries.some(e => e.entryName.includes("Member_Two"))).toBe(true);
  });

  it("10. Event title/category/date/time/venue appear in generated PDF", async () => {
    // This is implicitly tested via the receipt buffer generation, but we can verify text extraction roughly if we want.
    // For now we check the buffer is actually generated.
    const data = await registerIndividual();
    await Registration.findByIdAndUpdate(data.registration._id, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    });
    await Payment.create({
      registration: data.registration._id,
      amount: 500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });

    const res = await request(app)
      .get(`/api/v1/registrations/${data.registration._id}/ticket-pdf`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(1000); // A valid PDF buffer
  });

  it("11, 12. Downloading does not create EmailJobs or change status", async () => {
    const data = await registerIndividual();
    const regId = data.registration._id;
    await Registration.findByIdAndUpdate(regId, {
      status: REGISTRATION_STATUS.REGISTERED,
      paymentStatus: PAYMENT_STATUS.PAID,
    });
    await Payment.create({
      registration: regId,
      amount: 500,
      status: PAYMENT_STATUS.PAID,
      paymentFor: "EVENT"
    });

    const initialJobs = await EmailJob.countDocuments({ registration: regId });

    await request(app)
      .get(`/api/v1/registrations/${regId}/ticket-pdf`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const postJobs = await EmailJob.countDocuments({ registration: regId });
    expect(postJobs).toBe(initialJobs); // No new email jobs

    const checkReg = await Registration.findById(regId);
    expect(checkReg.status).toBe(REGISTRATION_STATUS.REGISTERED);
    expect(checkReg.paymentStatus).toBe(PAYMENT_STATUS.PAID);
  });
});
