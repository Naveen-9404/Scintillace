import { jest } from '@jest/globals';

// Setup unstable_mockModule before any dynamic imports
jest.unstable_mockModule("../../src/utils/email.js", () => ({
  default: {
    sendRegistrationConfirmation: jest.fn().mockResolvedValue(true),
    sendCertificateEmail: jest.fn().mockResolvedValue(true),
  }
}));

jest.unstable_mockModule("../../src/services/certificatePdf.service.js", () => ({
  default: {
    generateCertificatePdf: jest.fn().mockResolvedValue(Buffer.from("dummy-pdf-content")),
  }
}));

const { default: emailUtil } = await import("../../src/utils/email.js");
const { default: certificatePdfService } = await import("../../src/services/certificatePdf.service.js");
const { default: app } = await import("../../src/app.js");
const { default: mongoose } = await import("mongoose");
const { default: request } = await import("supertest");
const { default: Event } = await import("../../src/models/Event.js");
const { default: Registration } = await import("../../src/models/Registration.js");
const { default: Ticket } = await import("../../src/models/Ticket.js");
const { default: Certificate } = await import("../../src/models/Certificate.js");
const { EVENT_STATUS, EVENT_TYPES } = await import("../../src/constants/event.constants.js");
const { PAYMENT_STATUS } = await import("../../src/constants/registration.constants.js");
const { REGISTRATION_STATUS } = await import("../../src/constants/registration.constants.js");
const { default: ticketService } = await import("../../src/services/ticket.service.js");
const { default: certificateService } = await import("../../src/services/certificate.service.js");


describe("Team Certificate and Guest Access Integration Tests", () => {
  let teamEvent;
  let individualEvent;
  let festival;

  beforeEach(async () => {
    const dummyId = new mongoose.Types.ObjectId();
    const Festival = mongoose.model("Festival");

    festival = await Festival.create({
      title: "Test Festival",
      description: "Test Description",
      venue: "Test Venue",
      status: "PUBLISHED",
      createdBy: dummyId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
    });

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
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: festival._id
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
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: festival._id
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  // Helper
  const registerIndividual = async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: individualEvent._id,
      participantName: "Individual User",
      participantEmail: "indiv@example.com",
      participantPhone: "1111111111",
      collegeId: "C1",
      department: "CSE",
      yearOfStudy: "1"
    });
    return regRes.body.data;
  };

  const registerTeam = async () => {
    const regRes = await request(app).post("/api/v1/registrations/public").send({
      eventId: teamEvent._id,
      participantName: "Leader User",
      participantEmail: "leader@example.com",
      participantPhone: "2222222222",
      collegeId: "C2",
      department: "CSE",
      yearOfStudy: "2",
      teamName: "Team Alpha",
      members: [
        { participantName: "Leader User", participantEmail: "leader@example.com", participantPhone: "2222222222", collegeId: "C2", department: "CSE", yearOfStudy: "2" },
        { participantName: "Member 2", participantEmail: "member2@example.com", participantPhone: "333", collegeId: "C2", department: "CSE", yearOfStudy: "2" },
        { participantName: "Member 3", participantEmail: "member3@example.com", participantPhone: "444", collegeId: "C2", department: "CSE", yearOfStudy: "2" }
      ]
    });
    return regRes.body.data;
  };

  const approvePaymentAndCheckin = async (registrationId) => {
    const reg = await Registration.findByIdAndUpdate(
      registrationId, 
      { paymentStatus: PAYMENT_STATUS.PAID, checkedIn: true, status: REGISTRATION_STATUS.REGISTERED }, 
      { new: true }
    ).populate("team");

    await ticketService.createTicketsForRegistration(reg._id);
    return reg;
  };

  describe("Guest Certificate Retrieval", () => {
    it("should retrieve individual guest certificate", async () => {
      const regData = await registerIndividual();
      const reg = await approvePaymentAndCheckin(regData.registration._id);

      const allRegs = await Registration.find({ festival: reg.festival });
      console.log("ALL REGS FESTIVAL:", reg.festival);
      console.log("ALL REGS:", allRegs);

      // Admin triggers disburse
      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      const disburseResult = await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);
      console.log("DISBURSE RESULT:", disburseResult);

      // Try fetching as guest
      const res = await request(app)
        .get(`/api/v1/certificates/public/${reg._id}`)
        .set("X-Guest-Token", regData.guestToken);

      expect(res.status).toBe(200);
      expect(res.body.data.certificates).toHaveLength(1);
      expect(res.body.data.certificates[0].participantName).toBe("Individual User");
    });

    it("should reject invalid guest token", async () => {
      const regData = await registerIndividual();
      await approvePaymentAndCheckin(regData.registration._id);
      
      const res = await request(app)
        .get(`/api/v1/certificates/public/${regData.registration._id}`)
        .set("X-Guest-Token", "invalid-token");
        
      expect(res.status).toBe(401);
    });

    it("should reject cross-registration access", async () => {
      const regData1 = await registerIndividual();
      const reg1 = await approvePaymentAndCheckin(regData1.registration._id);

      const regData2 = await registerTeam();
      const reg2 = await approvePaymentAndCheckin(regData2.registration._id);

      // Admin triggers disburse
      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      await certificateService.disburseFestivalCertificates(reg1.festival.toString(), adminUser);

      // Try fetching reg2's certificates using reg1's token
      const res = await request(app)
        .get(`/api/v1/certificates/public/${reg2._id}`)
        .set("X-Guest-Token", regData1.guestToken);

      expect(res.status).toBe(401);
    });
  });

  describe("Team Certificate Generation", () => {
    it("should generate exactly N certificates for a team registration", async () => {
      const regData = await registerTeam();
      const reg = await approvePaymentAndCheckin(regData.registration._id);
      
      // Admin triggers disburse
      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);

      const res = await request(app)
        .get(`/api/v1/certificates/public/${reg._id}`)
        .set("X-Guest-Token", regData.guestToken);

      expect(res.status).toBe(200);
      expect(res.body.data.certificates).toHaveLength(3); // 3 members total
      
      const certNames = res.body.data.certificates.map(c => c.participantName).sort();
      expect(certNames).toEqual(["Leader User", "Member 2", "Member 3"]);
    });

    it("should not duplicate certificates if disburse is called twice", async () => {
      const regData = await registerTeam();
      const reg = await approvePaymentAndCheckin(regData.registration._id);
      
      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser); // Second time

      const res = await request(app)
        .get(`/api/v1/certificates/public/${reg._id}`)
        .set("X-Guest-Token", regData.guestToken);

      expect(res.status).toBe(200);
      expect(res.body.data.certificates).toHaveLength(3); 
    });

    it("should handle partial team generation recovery", async () => {
      const regData = await registerTeam();
      const reg = await approvePaymentAndCheckin(regData.registration._id);
      
      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);
      
      // Simulate failure by deleting one certificate
      const allCerts = await Certificate.find({ registration: reg._id });
      await Certificate.findByIdAndDelete(allCerts[0]._id);

      // Wait a moment to ensure new generated certificate will be distinct
      await new Promise(resolve => setTimeout(resolve, 50));

      // Retry disbursement
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);

      const res = await request(app)
        .get(`/api/v1/certificates/public/${reg._id}`)
        .set("X-Guest-Token", regData.guestToken);

      expect(res.status).toBe(200);
      expect(res.body.data.certificates).toHaveLength(3); 
      
      // Ensure the other two were NOT duplicated (which is guaranteed by having exactly 3)
      const certNames = res.body.data.certificates.map(c => c.participantName).sort();
      expect(certNames).toEqual(["Leader User", "Member 2", "Member 3"]);
    });
  });

  describe("Guest Certificate Download", () => {
    it("should allow downloading the generated PDF", async () => {
      const regData = await registerIndividual();
      const reg = await approvePaymentAndCheckin(regData.registration._id);

      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);

      const resList = await request(app)
        .get(`/api/v1/certificates/public/${reg._id}`)
        .set("X-Guest-Token", regData.guestToken);

      const certId = resList.body.data.certificates[0].id;

      const resDownload = await request(app)
        .get(`/api/v1/certificates/public/${reg._id}/download/${certId}`)
        .set("X-Guest-Token", regData.guestToken);

      expect(resDownload.status).toBe(200);
      expect(resDownload.headers['content-type']).toBe('application/pdf');
      expect(resDownload.body.toString()).toBe("dummy-pdf-content");
      expect(certificatePdfService.generateCertificatePdf).toHaveBeenCalled();
    });
  });

  describe("Guest Certificate Email Delivery", () => {
    it("should send individual guest certificate email to participantEmail", async () => {
      emailUtil.sendCertificateEmail.mockClear();
      const regData = await registerIndividual();
      const reg = await approvePaymentAndCheckin(regData.registration._id);

      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };
      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);

      expect(emailUtil.sendCertificateEmail).toHaveBeenCalledTimes(1);
      const callArgs = emailUtil.sendCertificateEmail.mock.calls[0];
      expect(callArgs[0].to).toBe("indiv@example.com"); // to email
      expect(callArgs[0].participantName).toBe("Individual User");
    });

    it("should send team member certificates individually to each member's participantEmail", async () => {
      emailUtil.sendCertificateEmail.mockClear();
      const regData = await registerTeam();
      const reg = await approvePaymentAndCheckin(regData.registration._id);

      const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: "SUPER_ADMIN" };

      await certificateService.disburseFestivalCertificates(reg.festival.toString(), adminUser);

      expect(emailUtil.sendCertificateEmail).toHaveBeenCalledTimes(3);
      
      const sentEmails = emailUtil.sendCertificateEmail.mock.calls.map(call => call[0].to);
      const expectedEmails = ["leader@example.com", "member2@example.com", "member3@example.com"];
      
      expectedEmails.forEach(email => {
        expect(sentEmails).toContain(email);
      });
    });
  });
});
