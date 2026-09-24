import User from "../models/User.js";
import Festival from "../models/Festival.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";
import Accommodation from "../models/accommodation.model.js";
import Ticket from "../models/Ticket.js";
import Certificate from "../models/Certificate.js";
import Team from "../models/team.model.js";

import {
  createExcelWorkbook,
  createMultiSheetWorkbook,
} from "../utils/excel.js";

/**
 * ============================================================
 * Generic Export Helper
 * ============================================================
 */

const exportModel = async (
  Model,
  {
    filter = {},
    populate = [],
    sort = {
      createdAt: -1,
    },
  } = {},
) => {
  let query = Model.find(filter);

  if (Array.isArray(populate)) {
    populate.forEach((item) => {
      query = query.populate(item);
    });
  }

  const records =
    await query
      .sort(sort)
      .lean()
      .exec();

  return records;
};

/**
 * ============================================================
 * Mapping Helpers
 * ============================================================
 */

const safeDate = (val) => val ? new Date(val).toISOString() : "N/A";

const mapUser = (user) => ({
  "User ID": user?._id?.toString() || "N/A",
  "Full Name": user?.fullName || "N/A",
  "Email": user?.email || "N/A",
  "Role": user?.role || "N/A",
  "Phone": user?.phone || "N/A",
  "College/Institution": user?.collegeId || "N/A",
  "Status": user?.status || "N/A",
  "Created At": safeDate(user?.createdAt),
});

const mapEvent = (event) => ({
  "Event ID": event?._id?.toString() || "N/A",
  "Title": event?.title || "N/A",
  "Category": event?.category || "N/A",
  "Type": event?.type || "N/A",
  "Status": event?.status || "N/A",
  "Festival": event?.festival?.title || "N/A",
  "Created At": safeDate(event?.createdAt),
});

const mapFestival = (festival) => ({
  "Festival ID": festival?._id?.toString() || "N/A",
  "Title": festival?.title || "N/A",
  "Status": festival?.status || "N/A",
  "Start Date": safeDate(festival?.startDate),
  "End Date": safeDate(festival?.endDate),
});

const mapRegistration = (reg) => {
  const isTeam = !!reg.team;
  return {
    "Registration ID": reg?._id?.toString() || "N/A",
    "Registration Date": safeDate(reg?.registrationDate),
    "Event": reg?.event?.title || "N/A",
    "Event Category": reg?.event?.category || "N/A",
    "Participation Type": isTeam ? "Team Leader" : "Individual",
    "Team Name": reg?.team?.teamName || "N/A",
    "Project Title": reg?.projectTitle || reg?.team?.projectTitle || "N/A",
    "Participant/Leader Name": reg?.participantName || "N/A",
    "Participant/Leader Email": reg?.participantEmail || "N/A",
    "Participant/Leader Phone": reg?.participantPhone || "N/A",
    "College ID": reg?.collegeId || "N/A",
    "Department": reg?.department || "N/A",
    "Year of Study": reg?.yearOfStudy || "N/A",
    "Registration Status": reg?.status || "N/A",
    "Payment Status": reg?.paymentStatus || "N/A",
    "Checked In": reg?.checkedIn ? "Yes" : "No",
    "Checked In At": safeDate(reg?.checkedInAt),
    "Cancellation Date": safeDate(reg?.cancellationDate),
    "Rejection Reason": reg?.rejectionReason || "N/A",
  };
};

const extractParticipants = (registrations) => {
  const participants = [];
  registrations.forEach(reg => {
    const isTeam = !!reg.team;
    
    // Always push the individual or leader
    participants.push({
      "Registration ID": reg?._id?.toString() || "N/A",
      "Event": reg?.event?.title || "N/A",
      "Event Category": reg?.event?.category || "N/A",
      "Team Name": reg?.team?.teamName || "N/A",
      "Participation Type": isTeam ? "Team Registration" : "Individual",
      "Role": isTeam ? "Leader" : "Participant",
      "Participant Name": reg?.participantName || "N/A",
      "Participant Email": reg?.participantEmail || "N/A",
      "Participant Phone": reg?.participantPhone || "N/A",
      "College ID": reg?.collegeId || "N/A",
      "Department": reg?.department || "N/A",
      "Year of Study": reg?.yearOfStudy || "N/A",
      "Project Title": reg?.projectTitle || reg?.team?.projectTitle || "N/A",
      "Registration Status": reg?.status || "N/A",
      "Payment Status": reg?.paymentStatus || "N/A",
      "Checked In": reg?.checkedIn ? "Yes" : "No",
      "Checked In At": safeDate(reg?.checkedInAt),
    });

    // Extract other members if team exists
    if (isTeam && Array.isArray(reg.team.members)) {
      // Find members who are not the leader
      const members = reg.team.members.filter(m => 
        m.participantEmail?.toLowerCase() !== reg.participantEmail?.toLowerCase()
      );
      
      members.forEach(m => {
        participants.push({
          "Registration ID": reg?._id?.toString() || "N/A",
          "Event": reg?.event?.title || "N/A",
          "Event Category": reg?.event?.category || "N/A",
          "Team Name": reg?.team?.teamName || "N/A",
          "Participation Type": "Team Registration",
          "Role": m.role || "Member",
          "Participant Name": m.participantName || "N/A",
          "Participant Email": m.participantEmail || "N/A",
          "Participant Phone": m.participantPhone || "N/A",
          "College ID": m.collegeId || "N/A",
          "Department": m.department || "N/A",
          "Year of Study": m.yearOfStudy || "N/A",
          "Project Title": reg?.team?.projectTitle || "N/A",
          "Registration Status": reg?.status || "N/A",
          "Payment Status": reg?.paymentStatus || "N/A",
          "Checked In": "N/A",
          "Checked In At": "N/A",
        });
      });
    }
  });
  return participants;
};

const mapTeam = (team) => ({
  "Team ID": team?._id?.toString() || "N/A",
  "Team Name": team?.teamName || "N/A",
  "Event": team?.event?.title || "N/A",
  "Event Category": team?.event?.category || "N/A",
  "Project Title": team?.projectTitle || "N/A",
  "Maximum Members": team?.maxMembers || "N/A",
  "Actual Member Count": Array.isArray(team?.members) ? team.members.length : 0,
  "Team Status": team?.status || "N/A",
  "Created At": safeDate(team?.createdAt),
});

const extractTeamMembers = (teams) => {
  const membersList = [];
  teams.forEach(team => {
    if (Array.isArray(team.members)) {
      team.members.forEach(m => {
        membersList.push({
          "Team ID": team?._id?.toString() || "N/A",
          "Team Name": team?.teamName || "N/A",
          "Event": team?.event?.title || "N/A",
          "Event Category": team?.event?.category || "N/A",
          "Role": m.role || "N/A",
          "Participant Name": m.participantName || "N/A",
          "Participant Email": m.participantEmail || "N/A",
          "Participant Phone": m.participantPhone || "N/A",
          "College ID": m.collegeId || "N/A",
          "Department": m.department || "N/A",
          "Year of Study": m.yearOfStudy || "N/A",
          "Joined At": safeDate(m.joinedAt),
        });
      });
    }
  });
  return membersList;
};

const mapPayment = (payment) => {
  let participantInfo = "N/A";
  if (payment?.paymentFor === "EVENT" && payment?.registration) {
    participantInfo = payment.registration.participantName || payment.registration.participantEmail || "N/A";
  } else if (payment?.paymentFor === "ACCOMMODATION" && payment?.accommodation) {
    participantInfo = payment.accommodation.participantName || payment.accommodation.participantEmail || "N/A";
  } else if (payment?.user) {
    participantInfo = payment.user.fullName || payment.user.email || "N/A";
  }

  return {
    "Payment ID": payment?._id?.toString() || "N/A",
    "Registration ID": payment?.registration?._id?.toString() || "N/A",
    "Accommodation ID": payment?.accommodation?._id?.toString() || "N/A",
    "Event": payment?.registration?.event?.title || "N/A",
    "Participant/Team": participantInfo,
    "Payment For": payment?.paymentFor || "N/A",
    "Amount": payment?.amount || 0,
    "Currency": payment?.currency || "INR",
    "Payment Status": payment?.status || "N/A",
    "Paid At": safeDate(payment?.paidAt),
    "Approved At": safeDate(payment?.approvedAt),
    "Rejected At": safeDate(payment?.rejectedAt),
    "Manual Verification": payment?.manualVerification ? "Yes" : "No",
    "Admin Note": payment?.adminNote || "N/A",
    "Confirmation Email Status": payment?.confirmationEmailStatus || "N/A",
  };
};

const mapAccommodation = (acc) => ({
  "Accommodation ID": acc?._id?.toString() || "N/A",
  "Registration ID": acc?.registration?.toString() || "N/A",
  "Participant Name": acc?.participantName || "N/A",
  "Participant Email": acc?.participantEmail || "N/A",
  "Participant Phone": acc?.participantPhone || "N/A",
  "College ID": acc?.collegeId || "N/A",
  "Department": acc?.department || "N/A",
  "Year of Study": acc?.yearOfStudy || "N/A",
  "Hostel Type": acc?.hostelType || "N/A",
  "Check In Date": safeDate(acc?.checkInDate),
  "Check Out Date": safeDate(acc?.checkOutDate),
  "Number of Days": acc?.accommodationDays || 0,
  "Total Amount": acc?.amount || 0,
  "Booking Status": acc?.bookingStatus || "N/A",
  "Payment Status": acc?.paymentStatus || "N/A",
  "Checked In": acc?.checkedIn ? "Yes" : "No",
  "Checked In At": safeDate(acc?.checkedInAt),
  "Checked Out": acc?.checkedOut ? "Yes" : "No",
  "Checked Out At": safeDate(acc?.checkedOutAt),
  "Created At": safeDate(acc?.createdAt),
});

const mapTicket = (ticket) => ({
  "Ticket ID": ticket?._id?.toString() || "N/A",
  "Registration ID": ticket?.registration?.toString() || "N/A",
  "Participant Name": ticket?.user?.fullName || "N/A",
  "Event": ticket?.event?.title || "N/A",
  "Ticket Number": ticket?.ticketNumber || "N/A",
  "Ticket Status": ticket?.status || "N/A",
  "Checked In": ticket?.checkedIn ? "Yes" : "No",
  "Check-in Time": safeDate(ticket?.checkedInAt),
  "Generated At": safeDate(ticket?.generatedAt),
  "Expires At": safeDate(ticket?.expiresAt),
});

const mapCertificate = (cert) => ({
  "Certificate ID": cert?._id?.toString() || "N/A",
  "Registration ID": cert?.registration?.toString() || "N/A",
  "Participant Name": cert?.participantName || cert?.user?.fullName || "N/A",
  "Event": cert?.event?.title || "N/A",
  "Certificate Type": cert?.certificateType || "N/A",
  "Certificate Number": cert?.certificateNumber || "N/A",
  "Status": cert?.status || "N/A",
  "Issued At": safeDate(cert?.issuedAt),
  "Email Sent": cert?.emailSent ? "Yes" : "No",
  "Created At": safeDate(cert?.createdAt),
});

/**
 * ============================================================
 * Export Users
 * ============================================================
 */

const exportUsers = async ({ filter = {} } = {}) => {
  const records = await exportModel(User, {
    filter,
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapUser), { sheetName: "Users" });
};

/**
 * ============================================================
 * Export Festivals
 * ============================================================
 */

const exportFestivals = async ({ filter = {} } = {}) => {
  const records = await exportModel(Festival, {
    filter,
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapFestival), { sheetName: "Festivals" });
};

/**
 * ============================================================
 * Export Events
 * ============================================================
 */

const exportEvents = async ({ filter = {} } = {}) => {
  const records = await exportModel(Event, {
    filter,
    populate: [
      { path: "festival", select: "title status" },
    ],
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapEvent), { sheetName: "Events" });
};

/**
 * ============================================================
 * Export Registrations
 * ============================================================
 */

const exportRegistrations = async ({ filter = {} } = {}) => {
  const records = await exportModel(Registration, {
    filter,
    populate: [
      { path: "event", select: "title category type" },
      { path: "team", select: "teamName status projectTitle members" },
    ],
    sort: { registrationDate: -1 },
  });

  return createMultiSheetWorkbook([
    {
      name: "Registrations",
      data: records.map(mapRegistration),
    },
    {
      name: "Participants",
      data: extractParticipants(records),
    }
  ]);
};

/**
 * ============================================================
 * Export Payments
 * ============================================================
 */

const exportPayments = async ({ filter = {} } = {}) => {
  const records = await exportModel(Payment, {
    filter,
    populate: [
      { path: "user", select: "fullName email phone" },
      { path: "registration", select: "status paymentStatus participantName participantEmail", populate: { path: "event", select: "title" } },
      { path: "accommodation", select: "participantName participantEmail" },
    ],
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapPayment), { sheetName: "Payments" });
};

/**
 * ============================================================
 * Export Accommodation
 * ============================================================
 */

const exportAccommodation = async ({ filter = {} } = {}) => {
  const records = await exportModel(Accommodation, {
    filter,
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapAccommodation), { sheetName: "Accommodation" });
};

/**
 * ============================================================
 * Export Tickets
 * ============================================================
 */

const exportTickets = async ({ filter = {} } = {}) => {
  const records = await exportModel(Ticket, {
    filter,
    populate: [
      { path: "user", select: "fullName" },
      { path: "event", select: "title" },
    ],
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapTicket), { sheetName: "Tickets" });
};

/**
 * ============================================================
 * Export Certificates
 * ============================================================
 */

const exportCertificates = async ({ filter = {} } = {}) => {
  const records = await exportModel(Certificate, {
    filter,
    populate: [
      { path: "user", select: "fullName" },
      { path: "event", select: "title" },
    ],
    sort: { createdAt: -1 },
  });
  return createExcelWorkbook(records.map(mapCertificate), { sheetName: "Certificates" });
};

/**
 * ============================================================
 * Export Complete Report
 * ============================================================
 */

const exportCompleteReport = async () => {
  const [
    users,
    festivals,
    events,
    registrations,
    payments,
    accommodation,
    tickets,
    certificates,
    teams
  ] = await Promise.all([
    User.find().lean().exec(),
    Festival.find().lean().exec(),
    Event.find().populate("festival", "title").lean().exec(),
    Registration.find().populate("event", "title category").populate("team", "teamName projectTitle members").lean().exec(),
    Payment.find().populate("user", "fullName email").populate({ path: "registration", populate: { path: "event", select: "title" } }).populate("accommodation").lean().exec(),
    Accommodation.find().lean().exec(),
    Ticket.find().populate("user", "fullName").populate("event", "title").lean().exec(),
    Certificate.find().populate("user", "fullName").populate("event", "title").lean().exec(),
    Team.find().populate("event", "title category").lean().exec(),
  ]);

  return createMultiSheetWorkbook([
    {
      name: "Registrations",
      data: registrations.map(mapRegistration),
    },
    {
      name: "Participants",
      data: extractParticipants(registrations),
    },
    {
      name: "Teams",
      data: teams.map(mapTeam),
    },
    {
      name: "Team Members",
      data: extractTeamMembers(teams),
    },
    {
      name: "Payments",
      data: payments.map(mapPayment),
    },
    {
      name: "Accommodation",
      data: accommodation.map(mapAccommodation),
    },
    {
      name: "Tickets",
      data: tickets.map(mapTicket),
    },
    {
      name: "Certificates",
      data: certificates.map(mapCertificate),
    },
    {
      name: "Events",
      data: events.map(mapEvent),
    },
    {
      name: "Festivals",
      data: festivals.map(mapFestival),
    },
    {
      name: "Users",
      data: users.map(mapUser),
    },
  ]);
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

const exportService = Object.freeze({
  exportUsers,
  exportFestivals,
  exportEvents,
  exportRegistrations,
  exportPayments,
  exportAccommodation,
  exportTickets,
  exportCertificates,
  exportCompleteReport,
});

export default exportService;