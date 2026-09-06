import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/app.js";

import Event from "../../src/models/Event.js";
import Team from "../../src/models/team.model.js";
import Registration from "../../src/models/Registration.js";
import { EVENT_STATUS, EVENT_TYPES } from "../../src/constants/event.constants.js";
import HTTP_STATUS from "../../src/constants/httpStatus.js";

describe("Public Registration Integration Tests", () => {
  let individualEvent;
  let teamEvent;
  let inactiveEvent;
  let otherIndividualEvent;

  beforeEach(async () => {
    const dummyId = new mongoose.Types.ObjectId();

    individualEvent = await Event.create({
      name: "Public Individual Code",
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

    otherIndividualEvent = await Event.create({
      name: "Other Individual Code",
      title: "Title",
      description: "Desc",
      type: EVENT_TYPES.INDIVIDUAL,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 200,
      isPaid: true,
      maxParticipants: 100,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: dummyId
    });

    teamEvent = await Event.create({
      name: "Public Team Hackathon",
      title: "Title",
      description: "Desc",
      type: EVENT_TYPES.TEAM,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 300,
      isPaid: true,
      teamSize: 3,
      maxParticipants: 100,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: dummyId
    });

    inactiveEvent = await Event.create({
      name: "Inactive Event",
      title: "Title",
      description: "Desc",
      type: EVENT_TYPES.INDIVIDUAL,
      status: EVENT_STATUS.INACTIVE,
      registrationOpen: false,
      registrationFee: 10,
      isPaid: false,
      maxParticipants: 100,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: dummyId
    });
  });

  describe("POST /api/v1/registrations/public", () => {
    
    it("should successfully register an individual guest", async () => {
      const payload = {
        eventId: individualEvent._id,
        participantName: "Guest User",
        participantEmail: "guest@example.com",
        participantPhone: "1234567890",
        collegeId: "C123"
      };

      const res = await request(app).post("/api/v1/registrations/public").send(payload);
      
      console.log(res.body);
      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(600);
      
      const reg = await Registration.findOne({ participantEmail: "guest@example.com" });
      expect(reg).toBeTruthy();
    });

    it("should reject duplicate individual registrations for the same event", async () => {
      const payload = {
        eventId: individualEvent._id,
        participantName: "Guest User",
        participantEmail: "guest@example.com",
        participantPhone: "1234567890",
        collegeId: "C123"
      };

      await request(app).post("/api/v1/registrations/public").send(payload);
      const res = await request(app).post("/api/v1/registrations/public").send(payload);
      
      expect(res.status).toBe(HTTP_STATUS.CONFLICT);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it("should allow the same email to register for a DIFFERENT event", async () => {
      const payload = {
        participantName: "Guest User",
        participantEmail: "guest@example.com",
        participantPhone: "1234567890",
        collegeId: "C123"
      };

      await request(app).post("/api/v1/registrations/public").send({ ...payload, eventId: individualEvent._id });
      const res = await request(app).post("/api/v1/registrations/public").send({ ...payload, eventId: otherIndividualEvent._id });
      
      expect(res.status).toBe(HTTP_STATUS.CREATED);
    });

    it("should successfully register a team", async () => {
      const payload = {
        eventId: teamEvent._id,
        participantName: "Leader Name",
        participantEmail: "leader@example.com",
        participantPhone: "1111111111",
        collegeId: "C11",
        teamName: "Awesome Team",
        members: [
          { participantName: "Leader Name", participantEmail: "leader@example.com", participantPhone: "1111111111", collegeId: "C11" },
          { participantName: "Member2", participantEmail: "m2@example.com", participantPhone: "2222222222", collegeId: "C22" }
        ]
      };

      const res = await request(app).post("/api/v1/registrations/public").send(payload);
      
      console.log(res.body);
      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body.data.amount).toBe(300); // server-side price enforcement
      expect(res.body.data.participantCount).toBe(2);
    });

    it("should reject duplicate team names", async () => {
      const payload1 = {
        eventId: teamEvent._id,
        participantName: "Leader A",
        participantEmail: "leadera@example.com",
        participantPhone: "1111111111",
        collegeId: "C11",
        teamName: "Unique Team 1",
        members: [
          { participantName: "Leader A", participantEmail: "leadera@example.com", participantPhone: "111", collegeId: "C11" },
          { participantName: "Member2", participantEmail: "m2@example.com", participantPhone: "222", collegeId: "C22" }
        ]
      };
      
      const payload2 = {
        eventId: teamEvent._id,
        participantName: "Leader B",
        participantEmail: "leaderb@example.com",
        participantPhone: "3333333333",
        collegeId: "C33",
        teamName: "Unique Team 1", // duplicate team name
        members: [
          { participantName: "Leader B", participantEmail: "leaderb@example.com", participantPhone: "333", collegeId: "C33" },
          { participantName: "Member3", participantEmail: "m3@example.com", participantPhone: "444", collegeId: "C44" }
        ]
      };

      await request(app).post("/api/v1/registrations/public").send(payload1);
      const res = await request(app).post("/api/v1/registrations/public").send(payload2);
      
      expect(res.status).toBe(HTTP_STATUS.CONFLICT);
      expect(res.body.message).toMatch(/team with this name is already registered/i);
    });

    it("should reject duplicate team leader", async () => {
      const payload1 = {
        eventId: teamEvent._id,
        participantName: "Duplicate Leader",
        participantEmail: "dup_leader@example.com",
        participantPhone: "5555555555",
        collegeId: "C55",
        teamName: "Team Alpha",
        members: [
          { participantName: "Duplicate Leader", participantEmail: "dup_leader@example.com", participantPhone: "555", collegeId: "C55" },
          { participantName: "Member2", participantEmail: "m2@example.com", participantPhone: "222", collegeId: "C22" }
        ]
      };
      
      const payload2 = {
        eventId: teamEvent._id,
        participantName: "Duplicate Leader",
        participantEmail: "dup_leader@example.com",
        participantPhone: "5555555555",
        collegeId: "C55",
        teamName: "Team Beta", // different team name, but same leader email
        members: [
          { participantName: "Duplicate Leader", participantEmail: "dup_leader@example.com", participantPhone: "555", collegeId: "C55" },
          { participantName: "Member3", participantEmail: "m3@example.com", participantPhone: "444", collegeId: "C44" }
        ]
      };

      await request(app).post("/api/v1/registrations/public").send(payload1);
      const res = await request(app).post("/api/v1/registrations/public").send(payload2);
      
      expect(res.status).toBe(HTTP_STATUS.CONFLICT);
      expect(res.body.message).toMatch(/already created a team/i);
    });

    it("should reject invalid/inactive events", async () => {
      const payload = {
        eventId: inactiveEvent._id,
        participantName: "Guest User",
        participantEmail: "guest@example.com",
        participantPhone: "1234567890",
        collegeId: "C123"
      };

      const res = await request(app).post("/api/v1/registrations/public").send(payload);
      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body.message).toMatch(/not open/i);
    });

    it("should reject invalid data", async () => {
      const payload = {
        eventId: individualEvent._id,
        // missing name, email, etc.
      };

      const res = await request(app).post("/api/v1/registrations/public").send(payload);
      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should ignore client-manipulated amount payload and use server-defined pricing", async () => {
      const payload = {
        eventId: individualEvent._id,
        participantName: "Hacker Client",
        participantEmail: "hacker@example.com",
        participantPhone: "9999999999",
        collegeId: "H999",
        amount: 1, // MALICIOUS PAYLOAD
        registrationFee: 1,
        price: 1
      };

      const res = await request(app).post("/api/v1/registrations/public").send(payload);
      
      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body.success).toBe(true);
      // Verify that server returned the authentic event registration fee
      expect(res.body.data.amount).toBe(600);
      
      const reg = await Registration.findOne({ participantEmail: "hacker@example.com" });
      expect(reg).toBeTruthy();
      // Registration model doesn't explicitly store 'amount', it relies on the linked Event's registrationFee
      // But we can check that it didn't sneak in somehow or that the returned amount is strict.
    });
  });

  describe("Admin Authorization Check", () => {
    it("should prevent unauthorized access to admin routes", async () => {
      const res = await request(app).get("/api/v1/registrations"); // no auth token
      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });
  });
});
