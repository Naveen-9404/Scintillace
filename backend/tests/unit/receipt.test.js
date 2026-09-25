import { jest } from "@jest/globals";

// Mock pdfkit to intercept text calls
const mockText = jest.fn().mockReturnThis();
const mockFont = jest.fn().mockReturnThis();
const mockFontSize = jest.fn().mockReturnThis();
const mockMoveDown = jest.fn().mockReturnThis();
const mockFillColor = jest.fn().mockReturnThis();
const mockImage = jest.fn().mockReturnThis();
const mockEnd = jest.fn();
const mockOn = jest.fn((event, cb) => {
  if (event === "data") {
    cb(Buffer.from("PDF-DATA"));
  }
  if (event === "end") {
    setTimeout(cb, 0); // Need to wait for next tick
  }
});

jest.unstable_mockModule("pdfkit", () => ({
  default: jest.fn().mockImplementation(() => ({
    text: mockText,
    font: mockFont,
    fontSize: mockFontSize,
    moveDown: mockMoveDown,
    fillColor: mockFillColor,
    image: mockImage,
    end: mockEnd,
    on: mockOn,
    page: { width: 500, height: 800 },
    y: 100,
  })),
}));

jest.unstable_mockModule("../../src/utils/qr.js", () => ({
  default: {
    generateTicketQRPayload: jest.fn().mockReturnValue("MOCK_PAYLOAD"),
    generateQRBuffer: jest.fn().mockResolvedValue(Buffer.from("QR_IMAGE")),
  },
}));

const { default: receiptUtil } = await import("../../src/utils/receipt.js");
const { default: qrUtil } = await import("../../src/utils/qr.js");

describe("generateRegistrationPDF", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const basePayment = {
    amount: 500,
    currency: "INR",
    paidAt: new Date(),
  };

  const baseEvent = {
    title: "Test Event",
    category: "TECH",
    type: "TEAM",
    venue: "Main Hall",
    startDateTime: new Date(),
    endDateTime: new Date(),
  };

  test("1,2,7,8,9. Individual ticket uses registration snapshot, has registration ID, ticket number, QR receives qrToken", async () => {
    const registration = {
      _id: "REG_123",
      participantName: "Indiv Name",
      participantEmail: "indiv@test.com",
      participantPhone: "111",
      collegeId: "C1",
      department: "CSE",
      yearOfStudy: "3",
      projectTitle: "My Project",
      event: baseEvent,
      registrationDate: new Date(),
    };

    const ticket = {
      ticketNumber: "TICKET_123",
      status: "ACTIVE",
      qrToken: "SECRET_TOKEN",
    };

    await receiptUtil.generateRegistrationPDF({
      payment: basePayment,
      registration,
      ticket,
    });

    const calls = mockText.mock.calls.map((c) => c[0]);

    // Ticket population includes qrToken tested implicitly here as it throws without it
    expect(qrUtil.generateTicketQRPayload).toHaveBeenCalledWith({
      ticketNumber: "TICKET_123",
      qrToken: "SECRET_TOKEN",
    });

    expect(calls).toContain("Indiv Name");
    expect(calls).toContain("indiv@test.com");
    expect(calls).toContain("111");
    expect(calls).toContain("C1");
    expect(calls).toContain("CSE");
    expect(calls).toContain("3");
    expect(calls).toContain("My Project");

    // Registration ID & Ticket Number
    expect(calls).toContain("REG_123");
    expect(calls).toContain("TICKET_123");
  });

  test("3. Team leader ticket contains leader details", async () => {
    const registration = {
      _id: "REG_TEAM",
      participantName: "Leader Name",
      participantEmail: "leader@test.com",
      participantPhone: "222",
      collegeId: "C2",
      department: "EEE",
      yearOfStudy: "4",
      team: {
        teamName: "Alpha Team",
        projectTitle: "Alpha Project",
        members: [
          {
            _id: "MEMBER_LEADER",
            participantName: "Leader Name",
            participantEmail: "leader@test.com",
            participantPhone: "222",
            collegeId: "C2",
            department: "EEE",
            yearOfStudy: "4",
            role: "LEADER",
          },
          {
            _id: "MEMBER_OTHER",
            participantName: "Other Name",
          },
        ],
      },
      event: baseEvent,
    };

    const ticket = {
      ticketNumber: "T_LEADER",
      status: "ACTIVE",
      qrToken: "QRT",
      teamMemberId: "MEMBER_LEADER",
    };

    await receiptUtil.generateRegistrationPDF({
      payment: basePayment,
      registration,
      ticket,
    });

    const calls = mockText.mock.calls.map((c) => c[0]);

    expect(calls).toContain("Leader Name");
    expect(calls).toContain("leader@test.com");
    expect(calls).toContain("Alpha Team");
    expect(calls).toContain("LEADER");
    expect(calls).toContain("Alpha Project");
  });

  test("4,5,6. Team member ticket contains THAT MEMBER'S details, NOT leader details, Team name and role appear", async () => {
    const registration = {
      _id: "REG_TEAM",
      participantName: "Leader Name", // Should NOT be used
      participantEmail: "leader@test.com", // Should NOT be used
      user: { fullName: "Leader Name" }, // Should NOT be used
      team: {
        teamName: "Alpha Team",
        projectTitle: "Alpha Project",
        members: [
          {
            _id: "MEMBER_LEADER",
            participantName: "Leader Name",
            role: "LEADER",
          },
          {
            _id: "MEMBER_OTHER",
            participantName: "Member Name",
            participantEmail: "member@test.com",
            participantPhone: "333",
            collegeId: "C3",
            department: "MECH",
            yearOfStudy: "2",
            role: "MEMBER",
          },
        ],
      },
      event: baseEvent,
    };

    const ticket = {
      ticketNumber: "T_MEMBER",
      status: "ACTIVE",
      qrToken: "QRT",
      teamMemberId: "MEMBER_OTHER",
    };

    await receiptUtil.generateRegistrationPDF({
      payment: basePayment,
      registration,
      ticket,
    });

    const calls = mockText.mock.calls.map((c) => c[0]);

    // MUST contain member details
    expect(calls).toContain("Member Name");
    expect(calls).toContain("member@test.com");
    expect(calls).toContain("333");
    expect(calls).toContain("MECH");
    expect(calls).toContain("2");
    expect(calls).toContain("MEMBER");
    expect(calls).toContain("Alpha Team");

    // MUST NOT contain leader details
    expect(calls).not.toContain("Leader Name");
    expect(calls).not.toContain("leader@test.com");
  });

  test("10. Existing legacy ticket without teamMemberId still uses the safe fallback", async () => {
    const registration = {
      _id: "REG_LEGACY",
      user: {
        fullName: "Fallback User",
        email: "fallback@test.com",
        phone: "999",
        collegeId: "CF",
      },
      event: baseEvent,
    };

    const ticket = {
      ticketNumber: "T_LEGACY",
      status: "ACTIVE",
      qrToken: "QRT",
    }; // NO teamMemberId, NO registration snapshot fields

    await receiptUtil.generateRegistrationPDF({
      payment: basePayment,
      registration,
      ticket,
    });

    const calls = mockText.mock.calls.map((c) => c[0]);

    expect(calls).toContain("Fallback User");
    expect(calls).toContain("fallback@test.com");
    expect(calls).toContain("999");
    expect(calls).toContain("CF");
  });
});
