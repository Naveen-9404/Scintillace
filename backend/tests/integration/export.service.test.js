import XLSX from "xlsx";
import "../setup.js";
import exportService from "../../src/services/export.service.js";
import User from "../../src/models/User.js";
import Festival from "../../src/models/Festival.js";
import Event from "../../src/models/Event.js";
import Registration from "../../src/models/Registration.js";
import Payment from "../../src/models/Payment.js";
import Accommodation from "../../src/models/accommodation.model.js";
import Team from "../../src/models/team.model.js";

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets = {};
  workbook.SheetNames.forEach((sheetName) => {
    sheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });
  return sheets;
};

describe("Export Service Tests", () => {
  it("should correctly map individual, team, and hybrid registrations and payments", async () => {
    const admin = await User.create({
      fullName: "Admin",
      email: "admin@test.com",
      password: "password123",
      phone: "9999999999",
      collegeId: "ADMIN123",
      role: "SUPER_ADMIN",
    });

    // 1. Create a Festival
    const festival = await Festival.create({
      title: "Scintillace 2026",
      description: "Annual Tech Fest",
      venue: "Main Campus",
      status: "PUBLISHED",
      startDate: new Date(),
      endDate: new Date(),
      createdBy: admin._id,
    });

    // 2. Create Events
    const indEvent = await Event.create({
      title: "Solo Singing",
      category: "CULTURAL",
      type: "INDIVIDUAL",
      description: "Singing Competition",
      venue: "Auditorium",
      eventDate: new Date(),
      festival: festival._id,
      registrationFee: 100,
      createdBy: admin._id,
    });

    const teamEvent = await Event.create({
      title: "Group Dance",
      category: "CULTURAL",
      type: "TEAM",
      description: "Dance Competition",
      venue: "Auditorium",
      eventDate: new Date(),
      festival: festival._id,
      teamSize: 3,
      registrationFee: 300,
      createdBy: admin._id,
    });

    const hybridEvent = await Event.create({
      title: "Project Expo",
      category: "TECHNICAL",
      type: "INDIVIDUAL_OR_TEAM",
      description: "Project Expo",
      venue: "Lab",
      eventDate: new Date(),
      festival: festival._id,
      teamSize: 4,
      registrationFee: 200,
      createdBy: admin._id,
    });

    // 3. Create Registrations

    // a. Individual Registration
    const regInd = await Registration.create({
      event: indEvent._id,
      festival: festival._id,
      participantName: "Alice",
      participantEmail: "alice@test.com",
      status: "REGISTERED",
    });

    // b. Team Registration
    const team = await Team.create({
      teamName: "Dance Crew",
      event: teamEvent._id,
      festival: festival._id,
      maxMembers: 3,
      inviteCode: "DANCE123",
      members: [
        {
          participantName: "Bob",
          participantEmail: "bob@test.com",
          role: "LEADER",
        },
        {
          participantName: "Charlie",
          participantEmail: "charlie@test.com",
          role: "MEMBER",
        },
      ],
    });

    await Registration.create({
      event: teamEvent._id,
      festival: festival._id,
      team: team._id,
      participantName: "Bob",
      participantEmail: "bob@test.com",
      status: "REGISTERED",
    });

    // c. Hybrid Individual
    await Registration.create({
      event: hybridEvent._id,
      festival: festival._id,
      participantName: "Dave",
      participantEmail: "dave@test.com",
      projectTitle: "AI Robot",
      status: "REGISTERED",
    });

    const frankUser = await User.create({
      fullName: "Frank Authenticated",
      email: "frank@auth.com",
      password: "password123",
      phone: "8888888888",
      collegeId: "FRANK123",
      department: "CSE",
      yearOfStudy: "3",
      role: "STUDENT",
    });

    const graceUser = await User.create({
      fullName: "Grace Authenticated",
      email: "grace@auth.com",
      password: "password123",
      phone: "9999999999",
      collegeId: "GRACE123",
      department: "ECE",
      yearOfStudy: "2",
      role: "STUDENT",
    });

    // d. Hybrid Team
    const hybridTeam = await Team.create({
      teamName: "Tech Titans",
      event: hybridEvent._id,
      festival: festival._id,
      maxMembers: 4,
      projectTitle: "AI Drone",
      inviteCode: "TECH123",
      members: [
        {
          participantName: "Eve",
          participantEmail: "eve@test.com",
          participantPhone: "7777777777",
          role: "LEADER",
        },
        {
          user: frankUser._id,
          role: "MEMBER",
        },
        {
          user: graceUser._id,
          role: "MEMBER",
        },
      ],
    });
    await Registration.create({
      event: hybridEvent._id,
      festival: festival._id,
      team: hybridTeam._id,
      participantName: "Eve",
      participantEmail: "eve@test.com",
      participantPhone: "7777777777",
      status: "REGISTERED",
    });

    // e. Payment
    await Payment.create({
      registration: regInd._id,
      paymentFor: "EVENT",
      amount: 100,
      status: "PAID",
      screenshotPublicId: "hidden_secret",
      adminNote: "All good",
    });

    // f. Accommodation
    await Accommodation.create({
      registration: regInd._id,
      festival: festival._id,
      participantName: "Alice",
      participantEmail: "alice@test.com",
      hostelType: "GIRLS",
      checkedIn: true,
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000), // +1 day
      accommodationDays: 1,
      amount: 200,
    });

    // Generate Export
    const buffer = await exportService.exportCompleteReport();
    const sheets = parseExcelBuffer(buffer);

    // Assert Registrations
    const regSheet = sheets["Registrations"];
    expect(regSheet).toBeDefined();
    expect(regSheet.length).toBe(4);

    const aliceRow = regSheet.find(
      (r) => r["Participant/Leader Name"] === "Alice",
    );
    expect(aliceRow["Event"]).toBe("Solo Singing");
    expect(aliceRow["Participation Type"]).toBe("Individual");

    const bobRow = regSheet.find((r) => r["Participant/Leader Name"] === "Bob");
    expect(bobRow["Participation Type"]).toBe("Team Leader");
    expect(bobRow["Team Name"]).toBe("Dance Crew");

    // Assert Participants
    const partSheet = sheets["Participants"];
    expect(partSheet).toBeDefined();
    // Alice(1) + Bob(1) + Charlie(1) + Dave(1) + Eve(1) + Frank(1) + Grace(1) = 7
    expect(partSheet.length).toBe(7);

    const charlieRow = partSheet.find(
      (r) => r["Participant Name"] === "Charlie",
    );
    expect(charlieRow).toBeDefined();
    expect(charlieRow["Role"]).toBe("MEMBER");
    expect(charlieRow["Team Name"]).toBe("Dance Crew");

    const frankRow = partSheet.find((r) => r["Participant Name"] === "Frank Authenticated");
    expect(frankRow).toBeDefined();
    expect(frankRow["Role"]).toBe("MEMBER");
    expect(frankRow["Team Name"]).toBe("Tech Titans");
    expect(frankRow["Project Title"]).toBe("AI Drone");
    expect(frankRow["Participant Phone"]).toBe("8888888888"); // Should correctly extract from populated user model
    expect(frankRow["Department"]).toBe("CSE");
    expect(frankRow["Year of Study"]).toBe("3");

    const graceRow = partSheet.find((r) => r["Participant Name"] === "Grace Authenticated");
    expect(graceRow).toBeDefined();
    expect(graceRow["Participant Phone"]).toBe("9999999999");
    expect(graceRow["Department"]).toBe("ECE");

    // Verify Eve (Leader) has her own phone, ensuring no fallback overlaps
    const eveRow = partSheet.find((r) => r["Participant Name"] === "Eve");
    expect(eveRow).toBeDefined();
    expect(eveRow["Participant Phone"]).toBe("7777777777");

    // Assert Teams
    const teamSheet = sheets["Teams"];
    expect(teamSheet.length).toBe(2);

    // Assert Team Members
    const membersSheet = sheets["Team Members"];
    expect(membersSheet.length).toBe(5); // 2 in Dance Crew, 3 in Tech Titans

    // Assert Payments
    const paySheet = sheets["Payments"];
    expect(paySheet.length).toBe(1);
    expect(paySheet[0]["Participant/Team"]).toBe("Alice");
    expect(paySheet[0]["screenshotPublicId"]).toBeUndefined(); // ensure hidden is not exposed

    // Assert Accommodation
    const accSheet = sheets["Accommodation"];
    expect(accSheet.length).toBe(1);
    expect(accSheet[0]["Participant Name"]).toBe("Alice");

    // Assert No [object Object] anywhere
    Object.values(sheets).forEach((sheet) => {
      sheet.forEach((row) => {
        Object.values(row).forEach((val) => {
          expect(String(val)).not.toContain("[object Object]");
        });
      });
    });
  });
});
