import request from "supertest";
import app from "../../src/app.js";
import Event from "../../src/models/Event.js";
import Festival from "../../src/models/Festival.js";
import Registration from "../../src/models/Registration.js";

describe("Team Integration Tests", () => {
  let leaderToken, leaderId;
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
    return { token: login.body.data.accessToken, id: res.body.data.user._id };
  };

  beforeEach(async () => {
    const leader = await registerUser("leader@example.com");
    leaderToken = leader.token;
    leaderId = leader.id;

    const festival = await Festival.create({
      title: "Scintillace 2K26",
      status: "PUBLISHED",
      createdBy: leaderId,
      description: "Test description",
      venue: "Main Stage",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      registration: { open: true },
    });
    festivalId = festival._id;

    const event = await Event.create({
      title: "Test Team Event",
      festival: festival._id,
      category: "TECHNICAL",
      type: "TEAM",
      teamSize: 4,
      status: "PUBLISHED",
      registrationMode: "FREE",
      isPaid: false,
      registrationRequired: true,
      registrationOpen: true,
      maxParticipants: 100,
      createdBy: leaderId,
      description: "Test description",
      venue: "Main Stage",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
    });
    eventId = event._id;
  });

  describe("Team Creation and Joining", () => {
    it("should allow a user to create a team", async () => {
      const res = await request(app)
        .post(`/api/v1/teams`)
        .set("Authorization", `Bearer ${leaderToken}`)
        .send({ eventId: eventId.toString(), teamName: "Alpha Team" })
        .expect(201) /* Or 200 */;
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.team.inviteCode).toBeDefined();
    });

    it("should prevent duplicate team creation by same user", async () => {
      await request(app)
        .post(`/api/v1/teams`)
        .set("Authorization", `Bearer ${leaderToken}`)
        .send({ eventId: eventId.toString(), teamName: "Alpha Team" });
      
      await request(app)
        .post(`/api/v1/teams`)
        .set("Authorization", `Bearer ${leaderToken}`)
        .send({ eventId: eventId.toString(), teamName: "Beta Team" })
        .expect(409); // Already in a team
    });

    it("should enforce team capacity under concurrency", async () => {
      const createRes = await request(app)
        .post(`/api/v1/teams`)
        .set("Authorization", `Bearer ${leaderToken}`)
        .send({ eventId: eventId.toString(), teamName: "Alpha Team" });
      
      const inviteCode = createRes.body.data.team.inviteCode;

      const users = [];
      for (let i = 0; i < 15; i++) {
        const u = await registerUser(`member${i}@example.com`);
        await Registration.create({
          user: u.id,
          event: eventId,
          festival: festivalId,
          status: "REGISTERED",
          participantName: `Member ${i}`,
        });
        users.push(u);
      }

      const reqs = users.map((u) => 
        request(app)
          .post(`/api/v1/teams/join`)
          .set("Authorization", `Bearer ${u.token}`)
          .send({ inviteCode })
      );
      
      const responses = await Promise.all(reqs);
      
      const successful = responses.filter(r => r.status === 200);
      const failed = responses.filter(r => r.status === 409 || r.status === 400); // Team is full or conflict
      
      // Leader is already 1 member. Max is 4. So 3 should succeed.
      expect(successful.length).toBe(3);
      expect(failed.length).toBe(12);
    }, 30000);
  });
});
