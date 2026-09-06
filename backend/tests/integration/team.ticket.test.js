import { jest } from '@jest/globals';

// Setup unstable_mockModule before any dynamic imports
jest.unstable_mockModule("../../src/utils/email.js", () => ({
  default: {
    sendRegistrationConfirmation: jest.fn().mockResolvedValue(true),
  }
}));

const { default: emailUtil } = await import("../../src/utils/email.js");
const { default: app } = await import("../../src/app.js");
const { default: mongoose } = await import("mongoose");
const { default: request } = await import("supertest");
const { default: Event } = await import("../../src/models/Event.js");
const { default: Registration } = await import("../../src/models/Registration.js");
const { default: Ticket } = await import("../../src/models/Ticket.js");
const { EVENT_STATUS, EVENT_TYPES } = await import("../../src/constants/event.constants.js");
const { PAYMENT_STATUS } = await import("../../src/constants/registration.constants.js");
const { default: ticketService } = await import("../../src/services/ticket.service.js");
const { default: registrationService } = await import("../../src/services/registration.service.js");


describe("Team Ticket and Guest Access Integration Tests", () => {
  let teamEvent;
  let individualEvent;

  beforeEach(async () => {
    const dummyId = new mongoose.Types.ObjectId();

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
      festival: dummyId
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
      festival: dummyId
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
        { participantName: "Leader User", participantEmail: "leader@example.com", participantPhone: "222", collegeId: "C2", department: "CSE", yearOfStudy: "2" },
        { participantName: "Member 2", participantEmail: "member2@example.com", participantPhone: "333", collegeId: "C2", department: "CSE", yearOfStudy: "2" },
        { participantName: "Member 3", participantEmail: "member3@example.com", participantPhone: "444", collegeId: "C2", department: "CSE", yearOfStudy: "2" }
      ]
    });
    if (regRes.status !== 201) {
      console.log("Team registration failed:", regRes.body);
    }
    return regRes.body.data;
  };

  it("Test 1 & 2: Individual registration -> generate -> retry -> exactly 1 ticket", async () => {
    const data = await registerIndividual();
    
    // Simulate paid
    await Registration.findByIdAndUpdate(data.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });

    // Test 1: Generate
    let tickets = await ticketService.createTicketsForRegistration(data.registration._id);
    expect(tickets.length).toBe(1);
    const initialTicketId = tickets[0]._id.toString();

    // Test 2: Generate again (Retry)
    tickets = await ticketService.createTicketsForRegistration(data.registration._id);
    expect(tickets.length).toBe(1);
    expect(tickets[0]._id.toString()).toBe(initialTicketId); // Test 6: ID remains unchanged
    expect(tickets[0]._isRecovered).toBe(true);
  });

  it("Test 3 & 4: Team with 3 members -> generate -> retry -> exactly 3 tickets", async () => {
    const data = await registerTeam();
    await Registration.findByIdAndUpdate(data.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });

    // Test 3: Generate
    let tickets = await ticketService.createTicketsForRegistration(data.registration._id);
    expect(tickets.length).toBe(3);
    
    const initialTicketIds = tickets.map(t => t._id.toString()).sort();

    // Test 4: Generate again (Retry)
    tickets = await ticketService.createTicketsForRegistration(data.registration._id);
    expect(tickets.length).toBe(3);
    const retryTicketIds = tickets.map(t => t._id.toString()).sort();
    
    // Test 6: ID remains unchanged
    expect(retryTicketIds).toEqual(initialTicketIds);
    tickets.forEach(t => expect(t._isRecovered).toBe(true));
  });

  it("Test 5 & 6 & 7: Partial team generation and retention", async () => {
    const data = await registerTeam();
    await Registration.findByIdAndUpdate(data.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });
    
    const reg = await Registration.findById(data.registration._id).populate("team");
    
    // Manually create tickets for member 1
    const baseTicketData = {
      registration: reg._id,
      user: null,
      event: reg.event,
      festival: reg.festival
    };

    const ticket1 = await ticketService.createTicket({ ...baseTicketData, teamMemberId: reg.team.members[0]._id });

    // Call createTicketsForRegistration
    const tickets = await ticketService.createTicketsForRegistration(reg._id);
    
    expect(tickets.length).toBe(3); // Test 5: final count = 3
    
    const ticketIds = tickets.map(t => t._id.toString());
    expect(ticketIds).toContain(ticket1._id.toString()); // Test 6: Retained

    // Test 7: Verify every member has exactly one ticket
    const memberTicketMap = {};
    tickets.forEach(t => {
      const mid = t.teamMemberId ? t.teamMemberId.toString() : 'individual';
      memberTicketMap[mid] = (memberTicketMap[mid] || 0) + 1;
    });
    
    expect(Object.keys(memberTicketMap).length).toBe(3);
    Object.values(memberTicketMap).forEach(count => expect(count).toBe(1));
  });

  it("Test 8: Verify every ticket has unique ticketNumber, unique qrToken, correct teamMemberId", async () => {
    const data = await registerTeam();
    await Registration.findByIdAndUpdate(data.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });
    const tickets = await ticketService.createTicketsForRegistration(data.registration._id);
    
    const numbers = new Set(tickets.map(t => t.ticketNumber));
    const qrTokens = new Set(tickets.map(t => t.qrToken));
    
    expect(numbers.size).toBe(3);
    expect(qrTokens.size).toBe(3);
    tickets.forEach(t => expect(t.teamMemberId).toBeDefined());
  });

  it("Test 9: Simulate duplicate-key race (11000) using retryTicketGeneration", async () => {
    const data = await registerIndividual();
    await Registration.findByIdAndUpdate(data.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });

    // Run two creation attempts concurrently
    const [tickets1, tickets2] = await Promise.all([
      ticketService.createTicketsForRegistration(data.registration._id),
      ticketService.createTicketsForRegistration(data.registration._id)
    ]);

    expect(tickets1.length).toBe(1);
    expect(tickets2.length).toBe(1);
    expect(tickets1[0]._id.toString()).toBe(tickets2[0]._id.toString());
    
    // Total tickets in DB should be exactly 1
    const count = await Ticket.countDocuments({ registration: data.registration._id });
    expect(count).toBe(1);
  });

  it("Test 10 & 11: Guest retrieval returns all generated tickets and cross-registration fails", async () => {
    const data1 = await registerTeam();
    const data2 = await registerIndividual();
    
    await Registration.findByIdAndUpdate(data1.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });
    await ticketService.createTicketsForRegistration(data1.registration._id);

    // Test 10: Retrieve with correct token
    const res = await request(app)
      .get(`/api/v1/tickets/public/${data1.registration._id}`)
      .set("X-Guest-Token", data1.guestToken);
      
    expect(res.status).toBe(200);
    expect(res.body.data.tickets.length).toBe(3);

    // Test 11: Cross-registration fails
    const crossRes = await request(app)
      .get(`/api/v1/tickets/public/${data2.registration._id}`)
      .set("X-Guest-Token", data1.guestToken);
      
    expect(crossRes.status).toBe(401);
  });

  it("Test 12 & 13: Invalid and Expired guest token fails", async () => {
    const data = await registerIndividual();
    
    // Test 12: Invalid
    const resInvalid = await request(app)
      .get(`/api/v1/tickets/public/${data.registration._id}`)
      .set("X-Guest-Token", "invalid_token_123");
      
    expect(resInvalid.status).toBe(401);

    // Test 13: Expired
    await Registration.findByIdAndUpdate(data.registration._id, { guestTokenExpiresAt: new Date(Date.now() - 1000) });
    
    const resExpired = await request(app)
      .get(`/api/v1/tickets/public/${data.registration._id}`)
      .set("X-Guest-Token", data.guestToken);
      
    expect(resExpired.status).toBe(401);
  });
  
  it("Verify email behavior during retry: does not send duplicate emails", async () => {
    const data = await registerIndividual();
    await Registration.findByIdAndUpdate(data.registration._id, { paymentStatus: PAYMENT_STATUS.PAID });

    // First generation (manual simulation)
    await registrationService.retryTicketGeneration(data.registration._id);
    expect(emailUtil.sendRegistrationConfirmation).toHaveBeenCalledTimes(1);
    
    // Second generation (retry)
    await registrationService.retryTicketGeneration(data.registration._id);
    // Should still be 1! Because we flag recovered tickets to skip duplicate emails.
    expect(emailUtil.sendRegistrationConfirmation).toHaveBeenCalledTimes(1);
  });
});
