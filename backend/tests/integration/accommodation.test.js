import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Festival from "../../src/models/Festival.js";
import Accommodation from "../../src/models/accommodation.model.js";
import Event from "../../src/models/Event.js";
import Registration from "../../src/models/Registration.js";

describe("Accommodation Integration Tests", () => {
  let userToken, userId;
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
    if (!login.body.data) {
      console.log("REGISTER FAILED:", res.body);
      console.log("LOGIN FAILED:", login.body);
    }
    return { token: login.body.data.accessToken, id: res.body.data.user._id };
  };

  beforeEach(async () => {
    const user = await registerUser("acc1@example.com");
    userToken = user.token;
    userId = user.id;

    const festival = await Festival.create({
      title: "Scintillace 2K26",
      status: "PUBLISHED",
      createdBy: userId,
      description: "Test description",
      venue: "Main Stage",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      registration: { open: true },
    });
    festivalId = festival._id;

    const event = await Event.create({
      title: "Test Event",
      festival: festivalId,
      category: "TECHNICAL",
      type: "INDIVIDUAL",
      status: "PUBLISHED",
      registrationMode: "FREE",
      isPaid: false,
      registrationRequired: true,
      registrationOpen: true,
      maxParticipants: 100,
      createdBy: userId,
      description: "Test description",
      venue: "Main Stage",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
    });

    const registration = await Registration.create({
      user: userId,
      event: event._id,
      festival: festivalId,
      status: "REGISTERED",
      participantName: "Test Participant",
    });

    global.registrationId = registration._id.toString();
    global.eventId = event._id.toString();
  });

  describe("Accommodation Booking", () => {
    it("should allow a user to book accommodation", async () => {
      const res = await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: global.registrationId,
          hostelType: "BOYS",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(201) /* Or 200 */;
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingStatus).toBe("Pending");
    });

    it("should prevent duplicate active bookings by the same user", async () => {
      await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: global.registrationId,
          hostelType: "BOYS",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(201) /* Or 200 */;
      
      await request(app)
        .post(`/api/v1/accommodation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          registrationId: global.registrationId,
          hostelType: "BOYS",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(409); // Conflict / Duplicate
    });

    it("should allow independent users to book accommodation without capacity limits", async () => {
      const users = [];
      for(let i=0; i<5; i++) {
        const u = await registerUser(`acc_indep${i}@example.com`);
        const r = await Registration.create({
          user: u.id,
          event: global.eventId,
          festival: festivalId,
          status: "REGISTERED",
          participantName: "Test Participant",
        });
        users.push({ ...u, regId: r._id.toString() });
      }

      const reqs = users.map((u) => 
        request(app)
          .post(`/api/v1/accommodation`)
          .set("Authorization", `Bearer ${u.token}`)
          .send({
            registrationId: u.regId,
            hostelType: "BOYS",
            checkInDate: new Date().toISOString(),
            checkOutDate: new Date(Date.now() + 86400000).toISOString(),
          })
      );
      
      const responses = await Promise.all(reqs);
      
      const successful = responses.filter(r => r.status === 201 || r.status === 200);
      expect(successful.length).toBe(5);
    }, 30000);

    it("should prevent duplicate active bookings for the same registration under concurrency", async () => {
      const checkIn = new Date().toISOString();
      const checkOut = new Date(Date.now() + 86400000).toISOString();

      const reqs = Array(5).fill().map(() => 
        request(app)
          .post(`/api/v1/accommodation`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            registrationId: global.registrationId,
            hostelType: "BOYS",
            checkInDate: checkIn,
            checkOutDate: checkOut,
          })
      );
      
      const responses = await Promise.all(reqs);
      
      const successful = responses.filter(r => r.status === 201 || r.status === 200);
      const failed = responses.filter(r => r.status === 409);
      
      expect(successful.length).toBe(1);
      expect(failed.length).toBe(4);

      const bookingsCount = await Accommodation.countDocuments({
        registration: global.registrationId,
      });
      expect(bookingsCount).toBe(1);
    }, 30000);
  });
});
