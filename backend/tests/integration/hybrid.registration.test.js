import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/app.js";

import Event from "../../src/models/Event.js";
import Team from "../../src/models/team.model.js";
import Registration from "../../src/models/Registration.js";
import { EVENT_STATUS, EVENT_TYPES } from "../../src/constants/event.constants.js";
import HTTP_STATUS from "../../src/constants/httpStatus.js";

describe("Hybrid Registration Tests (INDIVIDUAL_OR_TEAM)", () => {
  let hybridEvent;
  let workshopEvent;

  beforeEach(async () => {
    const dummyId = new mongoose.Types.ObjectId();

    hybridEvent = await Event.create({
      name: "Paper Presentation",
      title: "Title",
      description: "Desc",
      type: EVENT_TYPES.INDIVIDUAL_OR_TEAM,
      status: EVENT_STATUS.REGISTRATION_OPEN,
      registrationOpen: true,
      registrationFee: 200,
      isPaid: true,
      maxParticipants: 100,
      teamSize: 3,
      startDateTime: new Date(Date.now() + 86400000 * 2),
      registrationDeadline: new Date(Date.now() + 86400000),
      createdBy: dummyId,
      category: "TECHNICAL",
      festival: dummyId
    });

    workshopEvent = await Event.create({
      name: "Workshop",
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
      category: "WORKSHOP",
      festival: dummyId
    });
  });

  afterEach(async () => {
    await Event.deleteMany({});
    await Team.deleteMany({});
    await Registration.deleteMany({});
  });

  afterAll(async () => {
    // Teardown
  });

  it("Workshop Individual -> PASS", async () => {
    const res = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: workshopEvent._id,
        participantName: "John Doe",
        participantEmail: "john@test.com",
        participantPhone: "9999999999",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
      });
      
    if (res.status !== HTTP_STATUS.CREATED) {
       console.log("Workshop Individual Error:", res.body);
    }

    expect(res.status).toBe(HTTP_STATUS.CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(600); // Pricing check
    
    // Duplicate Protection check
    const dupRes = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: workshopEvent._id,
        participantName: "John Doe",
        participantEmail: "john@test.com",
        participantPhone: "9999999999",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
      });
    expect(dupRes.status).toBe(HTTP_STATUS.CONFLICT);
  });

  it("Workshop Team -> REJECT", async () => {
    const res = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: workshopEvent._id,
        teamName: "Team Workshop",
        projectTitle: "Project X",
        participantName: "Leader",
        participantEmail: "lead@test.com",
        participantPhone: "9999999999",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
        members: [
          {
            participantName: "Leader",
            participantEmail: "lead@test.com",
            participantPhone: "9999999999",
            collegeId: "C1",
            department: "CSE",
            yearOfStudy: "1",
          },
          {
            participantName: "Member 2",
            participantEmail: "mem@test.com",
            participantPhone: "8888888888",
            collegeId: "C1",
            department: "CSE",
            yearOfStudy: "1",
          }
        ]
      });

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("Paper Individual -> PASS", async () => {
    const res = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: hybridEvent._id,
        projectTitle: "My Solo Project",
        participantName: "Solo Coder",
        participantEmail: "solo@test.com",
        participantPhone: "9999999999",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
      });

    expect(res.status).toBe(HTTP_STATUS.CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(200); // Server pricing test

    // Verify database record
    const reg = await Registration.findOne({ event: hybridEvent._id });
    expect(reg).toBeTruthy();
    expect(reg.projectTitle).toBe("My Solo Project");
    expect(reg.team).toBeFalsy(); // No team created
    
    // Duplicate Protection check for hybrid events
    const dupRes = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: hybridEvent._id,
        projectTitle: "My Solo Project 2",
        participantName: "Solo Coder",
        participantEmail: "solo@test.com", // Same email
        participantPhone: "9999999999",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
      });
    expect(dupRes.status).toBe(HTTP_STATUS.CONFLICT);
  });

  it("Paper Team -> PASS", async () => {
    const res = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: hybridEvent._id,
        teamName: "Awesome Team",
        projectTitle: "Team Project X",
        participantName: "Team Lead",
        participantEmail: "lead@test.com",
        participantPhone: "9999999999",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
        members: [
          {
            participantName: "Team Lead",
            participantEmail: "lead@test.com",
            participantPhone: "9999999999",
            collegeId: "C1",
            department: "CSE",
            yearOfStudy: "1",
          },
          {
            participantName: "Team Member",
            participantEmail: "mem@test.com",
            participantPhone: "8888888888",
            collegeId: "C1",
            department: "CSE",
            yearOfStudy: "1",
          }
        ]
      });

    expect(res.status).toBe(HTTP_STATUS.CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(200); // Server pricing

    const team = await Team.findOne({ event: hybridEvent._id });
    expect(team).toBeTruthy();
    expect(team.teamName).toBe("Awesome Team");
    expect(team.projectTitle).toBe("Team Project X");
    
    const reg = await Registration.findOne({ team: team._id });
    expect(reg).toBeTruthy();
    
    // Duplicate protection: Different team names + same hybrid event
    const newTeamRes = await request(app)
      .post(`/api/v1/registrations/public`)
      .send({
        eventId: hybridEvent._id,
        teamName: "Another Team",
        projectTitle: "Team Project Y",
        participantName: "Other Lead",
        participantEmail: "other@test.com",
        participantPhone: "7777777777",
        collegeId: "C1",
        department: "CSE",
        yearOfStudy: "1",
        members: [
          {
            participantName: "Other Lead",
            participantEmail: "other@test.com",
            participantPhone: "7777777777",
            collegeId: "C1",
            department: "CSE",
            yearOfStudy: "1",
          },
          {
            participantName: "Other Member",
            participantEmail: "othermem@test.com",
            participantPhone: "6666666666",
            collegeId: "C1",
            department: "CSE",
            yearOfStudy: "1",
          }
        ]
      });
    expect(newTeamRes.status).toBe(HTTP_STATUS.CREATED);
  });
});
