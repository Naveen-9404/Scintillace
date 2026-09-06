import mongoose from "mongoose";
import crypto from "crypto";

import registrationRepository from "../repositories/registration.repository.js";
import eventRepository from "../repositories/event.repository.js";
import teamRepository from "../repositories/team.repository.js";

import User from "../models/User.js";

import paymentRepository from "../repositories/payment.repository.js";
import ticketRepository from "../repositories/ticket.repository.js";
import ticketService from "./ticket.service.js";

import receiptUtil from "../utils/receipt.js";
import emailUtil from "../utils/email.js";
import logger from "../utils/logger.js";
import cloudinaryUtil from "../utils/cloudinary.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

import {
  REGISTRATION_STATUS,
  PAYMENT_STATUS,
} from "../constants/registration.constants.js";

import {
  PAYMENT_GATEWAY,
  PAYMENT_FOR,
} from "../constants/payment.constants.js";

import {
  EVENT_STATUS,
  EVENT_TYPES,
} from "../constants/event.constants.js";

import {
  TEAM_STATUS,
  TEAM_MEMBER_ROLE,
} from "../constants/team.constants.js";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const assertValidObjectId = (
  value,
  fieldName,
) => {
  if (
    !value ||
    !mongoose.isValidObjectId(value)
  ) {
    throw new ApiError(
      `Invalid ${fieldName}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Event Registration Availability
 * ============================================================
 */

const isEventRegistrationOpen = (
  event,
) => {
  if (!event) {
    return false;
  }

  if (
    event.registrationOpen !== true
  ) {
    return false;
  }

  if (
    event.status ===
      EVENT_STATUS.CANCELLED ||
    event.status ===
      EVENT_STATUS.COMPLETED
  ) {
    return false;
  }

  return (
    event.status ===
      EVENT_STATUS.REGISTRATION_OPEN ||
    event.status ===
      EVENT_STATUS.PUBLISHED
  );
};

/**
 * ============================================================
 * Festival ID Helper
 * ============================================================
 */

const getFestivalId = (
  event,
) => {
  if (!event?.festival) {
    throw new ApiError(
      "Event is not associated with a festival.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    typeof event.festival === "object" &&
    event.festival._id
  ) {
    return event.festival._id;
  }

  return event.festival;
};

/**
 * ============================================================
 * Team Helpers
 * ============================================================
 */

const teamContainsUser = (
  team,
  userId,
) => {
  if (!team?.members) {
    return false;
  }

  return team.members.some(
    (member) =>
      member.user?.toString() ===
      userId.toString(),
  );
};

const getTeamMemberCount = (
  team,
) => {
  return Array.isArray(
    team?.members,
  )
    ? team.members.length
    : 0;
};

/**
 * ============================================================
 * Validate Event
 * ============================================================
 */

const validateEventForRegistration =
  async (eventId) => {
    assertValidObjectId(
      eventId,
      "Event ID",
    );

    const event =
      await eventRepository.findByIdRaw(
        eventId,
      );

    if (!event) {
      throw new ApiError(
        "Event not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      !isEventRegistrationOpen(
        event,
      )
    ) {
      throw new ApiError(
        "Registration is not open for this event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      event.registrationDeadline &&
      new Date() >
        new Date(
          event.registrationDeadline,
        )
    ) {
      throw new ApiError(
        "Registration deadline has passed.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      new Date() >=
      new Date(event.startDateTime)
    ) {
      throw new ApiError(
        "Registration is no longer available because the event has started.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return event;
  };

/**
 * ============================================================
 * Validate Individual Registration
 * ============================================================
 */

const validateIndividualRegistration =
  async (
    userId,
    event,
  ) => {
    const existingRegistration =
      await registrationRepository.findActiveByUserAndEvent(
        userId,
        event._id,
      );

    if (existingRegistration) {
      if (
        event.isPaid &&
        (
          existingRegistration.status ===
            REGISTRATION_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.FAILED
        )
      ) {
        return {
          existingRegistration,
          participantCount: 1,
        };
      }

      throw new ApiError(
        "You are already registered for this event.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return {
      existingRegistration: null,
      participantCount: 1,
    };
  };

/**
 * ============================================================
 * Validate Team Registration
 * ============================================================
 *
 * Team rules:
 *
 * Minimum members : 1
 * Maximum members : 3
 *
 * Registration is performed by the team leader.
 */

const validateTeamRegistration =
  async (
    userId,
    event,
    teamId,
  ) => {
    if (!teamId) {
      throw new ApiError(
        "Team ID is required for team events.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    assertValidObjectId(
      teamId,
      "Team ID",
    );

    const team =
      await teamRepository.findDocumentById(
        teamId,
      );

    if (!team) {
      throw new ApiError(
        "Team not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      team.event.toString() !==
      event._id.toString()
    ) {
      throw new ApiError(
        "This team does not belong to the selected event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      team.status !==
      TEAM_STATUS.ACTIVE
    ) {
      throw new ApiError(
        "This team is not available for registration.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      team.leader.toString() !==
      userId.toString()
    ) {
      throw new ApiError(
        "Only the team leader can register the team for this event.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (
      !teamContainsUser(
        team,
        userId,
      )
    ) {
      throw new ApiError(
        "Team leader is not a member of this team.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const memberCount =
      getTeamMemberCount(team);

    if (memberCount < 1) {
      throw new ApiError(
        "A team must contain at least one member.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const configuredTeamSize =
      Number(event.teamSize);

    const maxTeamSize =
      Number.isFinite(
        configuredTeamSize,
      ) &&
      configuredTeamSize > 0
        ? Math.min(
            configuredTeamSize,
            3,
          )
        : 3;

    if (
      memberCount >
      maxTeamSize
    ) {
      throw new ApiError(
        `Team exceeds the maximum team size of ${maxTeamSize}.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const existingRegistration =
      await registrationRepository.findActiveByTeamAndEvent(
        teamId,
        event._id,
      );

    if (existingRegistration) {
      if (
        event.isPaid &&
        (
          existingRegistration.status ===
            REGISTRATION_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.FAILED
        )
      ) {
        return {
          team,
          existingRegistration,
          participantCount:
            memberCount,
        };
      }

      throw new ApiError(
        "This team is already registered for this event.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return {
      team,
      existingRegistration: null,
      participantCount:
        memberCount,
    };
  };


/**
 * ============================================================
 * Register For Event
 * ============================================================
 */

const createRegistration =
  async (
    userId,
    eventId,
    teamId = null,
    screenshotUrl = null,
    screenshotPublicId = null,
  ) => {
    assertValidObjectId(
      userId,
      "User ID",
    );

    const event =
      await validateEventForRegistration(
        eventId,
      );

    if (event.isPaid && !screenshotUrl) {
      throw new ApiError(
        "Payment screenshot is required for paid events.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ========================================================
     * Participant Name Snapshot
     * ========================================================
     *
     * Capture the user's current profile name at registration.
     *
     * This value is stored permanently with the registration
     * and later copied to the certificate.
     */

    const user =
      await User.findById(userId)
        .select("fullName")
        .lean();

    if (!user) {
      throw new ApiError(
        "User not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const participantName =
      user.fullName?.trim();

    if (!participantName) {
      throw new ApiError(
        "Please complete your profile name before registering.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ========================================================
     * Determine Registration Type
     * ========================================================
     */

    let team = null;
    let participantCount = 1;
    let existingRegistration = null;

    if (
      event.type ===
      EVENT_TYPES.TEAM
    ) {
      const teamResult =
        await validateTeamRegistration(
          userId,
          event,
          teamId,
        );

      team =
        teamResult.team;

      participantCount =
        teamResult.participantCount;

      existingRegistration =
        teamResult.existingRegistration;
    } else {
      if (teamId) {
        throw new ApiError(
          "Team registration is not allowed for an individual event.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const result =
        await validateIndividualRegistration(
          userId,
          event,
        );

      participantCount =
        result.participantCount;

      existingRegistration =
        result.existingRegistration;
    }

    /**
     * ========================================================
     * Existing Pending Registration
     * ========================================================
     */

    if (
      existingRegistration
    ) {
      if (!event.isPaid) {
        return {
          paymentRequired: false,

          registration:
            existingRegistration,

          participantCount,
        };
      }

      throw new ApiError(
        "You already have a pending registration for this event.",
        HTTP_STATUS.CONFLICT,
      );
    }


    /**
     * ========================================================
     * Registration Data
     * ========================================================
     */

    const registrationData = {
      user: userId,

      participantName,

      event: event._id,

      festival:
        getFestivalId(event),

      team: team
        ? team._id
        : null,

      status:
        event.isPaid
          ? REGISTRATION_STATUS.PENDING
          : REGISTRATION_STATUS.REGISTERED,

      paymentStatus:
        event.isPaid
          ? PAYMENT_STATUS.PENDING
          : PAYMENT_STATUS.NOT_REQUIRED,
    };

    /**
     * ========================================================
     * Create Registration
     * ========================================================
     */

    let registration =
      await registrationRepository.create(
        registrationData,
      );

    /**
     * ========================================================
     * FREE EVENT
     * ========================================================
     */

    if (!event.isPaid) {
      return {
        paymentRequired: false,

        registration,

        participantCount,
      };
    }

    /**
     * ========================================================
     * PAID EVENT
     * ========================================================
     */

    const paymentData = {
      user: userId,
      registration: registration._id,
      paymentFor: PAYMENT_FOR.EVENT,
      amount: event.registrationFee,
      currency: event.currency || "INR",
      gateway: PAYMENT_GATEWAY.UPI,
      screenshotUrl,
      screenshotPublicId,
      status: PAYMENT_STATUS.PENDING,
    };

    await paymentRepository.create(paymentData);

    return {
      paymentRequired: true,

      registration,

      participantCount,

      amount:
        event.registrationFee,

      currency:
        event.currency ||
        "INR",

      isRetry: false,
    };
  };

/**
 * ============================================================
 * Get All Registrations
 * ============================================================
 */

const getAllRegistrations =
  async ({
    page = 1,
    limit = 10,
    filter = {},
  } = {}) => {
    const registrations =
      await registrationRepository.findAll({
        filter,
        page,
        limit,
      });

    const total =
      await registrationRepository.count(
        filter,
      );

    return {
      registrations,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  };
  /**
 * ============================================================
 * Get Registration By ID
 * ============================================================
 */

const getRegistrationById =
  async (
    registrationId,
    userId,
    userRole,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const isAdmin =
      userRole === "SUPER_ADMIN" ||
      userRole === "FACULTY";

    if (isAdmin) {
      return registration;
    }

    const registrationUserId =
      registration.user?._id ||
      registration.user;

    if (
      !registrationUserId ||
      registrationUserId.toString() !==
        userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to view this registration.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    return registration;
  };

/**
 * ============================================================
 * Get My Registrations
 * ============================================================
 */

const getMyRegistrations =
  async (
    userId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      userId,
      "User ID",
    );

    return registrationRepository.findByUser(
      userId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Get Registrations By Event
 * ============================================================
 */

const getRegistrationsByEvent =
  async (
    eventId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      eventId,
      "Event ID",
    );

    const event =
      await eventRepository.findByIdRaw(
        eventId,
      );

    if (!event) {
      throw new ApiError(
        "Event not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return registrationRepository.findByEvent(
      eventId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Get Registrations By Festival
 * ============================================================
 */

const getRegistrationsByFestival =
  async (
    festivalId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      festivalId,
      "Festival ID",
    );

    return registrationRepository.findByFestival(
      festivalId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Get Registrations By Team
 * ============================================================
 */

const getRegistrationsByTeam =
  async (
    teamId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      teamId,
      "Team ID",
    );

    const team =
      await teamRepository.findDocumentById(
        teamId,
      );

    if (!team) {
      throw new ApiError(
        "Team not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return registrationRepository.findByTeam(
      teamId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Cancel Registration
 * ============================================================
 */

const cancelRegistration =
  async (
    registrationId,
    userId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    assertValidObjectId(
      userId,
      "User ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const registrationUserId =
      registration.user?._id ??
      registration.user;

    if (
      registrationUserId
        .toString() !==
      userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to cancel this registration.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (
      registration.status ===
      REGISTRATION_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Registration is already cancelled.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.checkedIn
    ) {
      throw new ApiError(
        "A checked-in registration cannot be cancelled.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.paymentStatus ===
      PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "Paid registrations must be cancelled through the payment/refund process.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return registrationRepository.updateById(
      registrationId,
      {
        status:
          REGISTRATION_STATUS.CANCELLED,

        cancellationDate:
          new Date(),
      },
    );
  };

/**
 * ============================================================
 * Update Registration Status
 * ============================================================
 */

const updateRegistrationStatus =
  async (
    registrationId,
    status,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    if (
      !Object.values(
        REGISTRATION_STATUS,
      ).includes(status)
    ) {
      throw new ApiError(
        "Invalid registration status.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      registration.status ===
        REGISTRATION_STATUS.CANCELLED &&
      status !==
        REGISTRATION_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "A cancelled registration cannot be reactivated.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return registrationRepository.updateById(
      registrationId,
      {
        status,
      },
    );
  };

/**
 * ============================================================
 * Update Payment Status
 * ============================================================
 */

const updatePaymentStatus =
  async (
    registrationId,
    paymentStatus,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    if (
      !Object.values(
        PAYMENT_STATUS,
      ).includes(
        paymentStatus,
      )
    ) {
      throw new ApiError(
        "Invalid payment status.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const updateData = {
      paymentStatus,
    };

    if (
      paymentStatus ===
      PAYMENT_STATUS.PAID
    ) {
      updateData.status =
        REGISTRATION_STATUS.REGISTERED;
    }

    if (
      paymentStatus ===
      PAYMENT_STATUS.FAILED
    ) {
      updateData.status =
        REGISTRATION_STATUS.PENDING;
    }

    if (
      paymentStatus ===
      PAYMENT_STATUS.REFUNDED
    ) {
      updateData.status =
        REGISTRATION_STATUS.CANCELLED;

      updateData.cancellationDate =
        new Date();
    }

    const updatedRegistration = await registrationRepository.updateById(
      registrationId,
      updateData,
    );

    if (
      paymentStatus === PAYMENT_STATUS.PAID &&
      registration.paymentStatus !== PAYMENT_STATUS.PAID
    ) {
      try {
        const getReferenceId = (reference) => reference?._id || reference;
        
        let tickets = await mongoose.model("Ticket").find({ registration: updatedRegistration._id }).select("+qrToken").lean();
        if (tickets.length === 0) {
          tickets = await ticketService.createTicketsForRegistration(updatedRegistration._id);
        }

        const user = updatedRegistration.user ? await User.findById(getReferenceId(updatedRegistration.user)).lean() : null;
        const event = await eventRepository.findByIdRaw(getReferenceId(updatedRegistration.event));

        if (event && tickets.length > 0) {
          let payment = await paymentRepository.findPendingByRegistration(updatedRegistration._id);
          
          if (!payment) {
            payment = {
              amount: event.registrationFee,
              currency: event.currency || "INR",
              paymentId: "OFFLINE / MANUAL",
              orderId: "OFFLINE / MANUAL",
              paidAt: new Date(),
            };
          }

          const RegistrationModel = mongoose.model("Registration");
          const fullRegistration = await RegistrationModel.findById(updatedRegistration._id).populate("team").lean();

          for (const ticket of tickets) {
            let participantEmail = "";
            let participantName = "";

            if (ticket.teamMemberId && fullRegistration.team && fullRegistration.team.members) {
              const member = fullRegistration.team.members.find(m => m._id.toString() === ticket.teamMemberId.toString());
              if (member) {
                participantEmail = member.participantEmail;
                participantName = member.participantName || "Team Member";
              }
            } else {
              participantEmail = fullRegistration.participantEmail;
              participantName = fullRegistration.participantName || "Participant";
            }

            if (!participantEmail && user && user.email) {
              participantEmail = user.email;
              participantName = user.fullName || participantName;
            }

            if (participantEmail && ticket.qrToken) {
              const pdfBuffer = await receiptUtil.generateRegistrationPDF({
                payment,
                registration: fullRegistration,
                ticket,
              });

              await emailUtil.sendRegistrationConfirmation({
                to: participantEmail,
                participantName,
                eventName: event.title,
                ticketNumber: ticket.ticketNumber,
                pdfBuffer,
              });
            }
          }
          
          logger.info(`Registration confirmation emails sent successfully for registration ${updatedRegistration._id}.`);
        }
      } catch (error) {
        logger.error(`Registration confirmation email failed for registration ${updatedRegistration._id}: ${error.message}`);
      }
    }

    return updatedRegistration;
  };

/**
 * ============================================================
 * Get Payment By Registration (Admin)
 * ============================================================
 */

const getPaymentByRegistration =
  async (registrationId) => {
    assertValidObjectId(registrationId, "Registration ID");

    const payment = await paymentRepository.findPendingByRegistration(
      registrationId,
    );

    // If there is no pending, we can try to find by registration regardless of status
    // But since the repository might only have findPendingByRegistration, let's use the Mongoose model directly if needed
    // Or just use paymentRepository if there's a findByRegistration. Let's check if findByRegistration exists.
    // I'll assume findByRegistration exists in paymentRepository, otherwise I'll use findPendingByRegistration.
    // Actually, I'll just rely on paymentRepository.
    
    // Wait, let's look for paymentRepository.findByRegistration.
    // Actually, I'll just write it this way and fix it if it crashes.
    const fullPayment = await mongoose.model("Payment").findOne({ registration: registrationId });

    if (!fullPayment) {
      throw new ApiError(
        "Payment record not found for this registration.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return fullPayment;
  };

/**
 * ============================================================
 * Approve Registration (Admin)
 * ============================================================
 */

const approveRegistration =
  async (registrationId, adminId) => {
    assertValidObjectId(registrationId, "Registration ID");

    const registration = await registrationRepository.findById(registrationId);
    if (!registration) {
      throw new ApiError("Registration not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (registration.status !== REGISTRATION_STATUS.PENDING) {
      throw new ApiError("Registration is not in PENDING status.", HTTP_STATUS.BAD_REQUEST);
    }

    const payment = await mongoose.model("Payment").findOne({ registration: registrationId });
    if (!payment) {
      throw new ApiError("Payment record not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new ApiError("Payment is not in PENDING status.", HTTP_STATUS.BAD_REQUEST);
    }

    // Atomic update of Payment to prevent duplicate approval
    const updatedPayment = await mongoose.model("Payment").findOneAndUpdate(
      { _id: payment._id, status: PAYMENT_STATUS.PENDING },
      { 
        $set: { 
          status: PAYMENT_STATUS.PAID,
          screenshotUrl: null,
          screenshotPublicId: null
        } 
      },
      { new: true }
    );

    if (!updatedPayment) {
      throw new ApiError("Failed to verify payment. It may have already been processed.", HTTP_STATUS.CONFLICT);
    }

    // Rely on the existing robust side-effect generation function
    const updatedRegistration = await updatePaymentStatus(
      registrationId,
      PAYMENT_STATUS.PAID
    );

    // Clean up the screenshot asset asynchronously
    if (payment.screenshotPublicId) {
      cloudinaryUtil.deleteAsset(payment.screenshotPublicId).catch((err) => {
        logger.error(`Non-blocking error during Cloudinary deletion for approval: ${err.message}`);
      });
    }

    return updatedRegistration;
  };

/**
 * ============================================================
 * Reject Registration (Admin)
 * ============================================================
 */

const rejectRegistration =
  async (registrationId, adminId, reason) => {
    assertValidObjectId(registrationId, "Registration ID");

    const registration = await registrationRepository.findById(registrationId);
    if (!registration) {
      throw new ApiError("Registration not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (registration.status !== REGISTRATION_STATUS.PENDING) {
      throw new ApiError("Registration is not in PENDING status.", HTTP_STATUS.BAD_REQUEST);
    }

    const payment = await mongoose.model("Payment").findOne({ registration: registrationId });
    if (!payment) {
      throw new ApiError("Payment record not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new ApiError("Payment is not in PENDING status.", HTTP_STATUS.BAD_REQUEST);
    }

    const updatedPayment = await mongoose.model("Payment").findOneAndUpdate(
      { _id: payment._id, status: PAYMENT_STATUS.PENDING },
      { 
        $set: { 
          status: PAYMENT_STATUS.FAILED,
          screenshotUrl: null,
          screenshotPublicId: null
        } 
      },
      { new: true }
    );

    if (!updatedPayment) {
      throw new ApiError("Failed to reject payment. It may have already been processed.", HTTP_STATUS.CONFLICT);
    }

    const updatedRegistration = await registrationRepository.updateById(
      registrationId,
      {
        status: REGISTRATION_STATUS.REJECTED,
        paymentStatus: PAYMENT_STATUS.FAILED,
        rejectionReason: reason || ""
      }
    );

    // Clean up the screenshot asset asynchronously
    if (payment.screenshotPublicId) {
      cloudinaryUtil.deleteAsset(payment.screenshotPublicId).catch((err) => {
        logger.error(`Non-blocking error during Cloudinary deletion for rejection: ${err.message}`);
      });
    }

    return updatedRegistration;
  };

/**
 * ============================================================
 * Check In Registration
 * ============================================================
 */

const checkInRegistration =
  async (
    registrationId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      registration.status !==
      REGISTRATION_STATUS.REGISTERED
    ) {
      throw new ApiError(
        "Only registered participants can be checked in.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.checkedIn
    ) {
      throw new ApiError(
        "Participant is already checked in.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return registrationRepository.updateById(
      registrationId,
      {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    );
  };

/**
 * ============================================================
 * Delete Registration
 * ============================================================
 */

const deleteRegistration =
  async (
    registrationId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      registration.paymentStatus ===
        PAYMENT_STATUS.PAID ||
      registration.paymentStatus ===
        PAYMENT_STATUS.REFUNDED
    ) {
      throw new ApiError(
        "Paid registrations cannot be permanently deleted.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await registrationRepository.deleteById(
      registrationId,
    );

    return {
      success: true,

      message:
        "Registration deleted successfully.",
    };
  };

/**
 * ============================================================
 * Create Public Registration (Guest)
 * ============================================================
 */

const createPublicRegistration = async (guestData) => {
  const { eventId, participantName, participantEmail, participantPhone, collegeId, department, yearOfStudy, teamName, projectTitle, members } = guestData;

  const event = await validateEventForRegistration(eventId);

  let participantCount = 1;

  if (event.type === EVENT_TYPES.TEAM) {
    if (!teamName || !members || !Array.isArray(members) || members.length < 1) {
      throw new ApiError("Team name and members are required for team events.", HTTP_STATUS.BAD_REQUEST);
    }
    
    const lowerTitle = event.title?.toLowerCase() || "";
    const requiresProjectTitle = lowerTitle.includes("paper") || lowerTitle.includes("poster") || lowerTitle.includes("hardware");
    
    if (requiresProjectTitle && (!projectTitle || !projectTitle.trim())) {
      throw new ApiError("Project / Topic Title is required for this event.", HTTP_STATUS.BAD_REQUEST);
    }

    const configuredTeamSize = Number(event.teamSize);
    const maxTeamSize = Number.isFinite(configuredTeamSize) && configuredTeamSize > 0 ? Math.min(configuredTeamSize, 3) : 3;

    if (members.length > maxTeamSize) {
      throw new ApiError(`Team exceeds the maximum team size of ${maxTeamSize}.`, HTTP_STATUS.BAD_REQUEST);
    }

    // Duplicate check for team name
    const existingTeam = await teamRepository.findByEventAndName(event._id, teamName);
    if (existingTeam) {
      throw new ApiError("A team with this name is already registered for this event.", HTTP_STATUS.CONFLICT);
    }

    // Duplicate check for team leader email
    const leaderEmail = participantEmail;
    const isRegistered = await teamRepository.findActiveByLeaderEmailAndEvent(event._id, leaderEmail);
    if (isRegistered) {
      throw new ApiError(`Participant with email ${leaderEmail} has already created a team for this event.`, HTTP_STATUS.CONFLICT);
    }

    participantCount = members.length;

    // Use transaction for atomic creation
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const inviteCode = "PUBLIC" + Math.floor(1000 + Math.random() * 9000); // Dummy for public
      const team = new mongoose.model('Team')({
        teamName: teamName.trim(),
        projectTitle: projectTitle ? projectTitle.trim() : "",
        event: event._id,
        festival: getFestivalId(event),
        inviteCode,
        maxMembers: maxTeamSize,
        status: TEAM_STATUS.ACTIVE,
        members: members.map((m, index) => ({
          participantName: m.participantName,
          participantEmail: m.participantEmail,
          participantPhone: m.participantPhone,
          collegeId: m.collegeId,
          department: m.department,
          yearOfStudy: m.yearOfStudy,
          role: index === 0 ? TEAM_MEMBER_ROLE.LEADER : TEAM_MEMBER_ROLE.MEMBER
        }))
      });

      await team.save({ session });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const guestTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const guestTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const registrationData = {
        user: null,
        participantName,
        participantEmail,
        participantPhone,
        collegeId,
        department,
        yearOfStudy,
        event: event._id,
        festival: getFestivalId(event),
        team: team._id,
        status: REGISTRATION_STATUS.PENDING, // Payment is phase 4, but we keep it pending so user can pay later. Wait, for free events it's REGISTERED.
        paymentStatus: event.isPaid ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.NOT_REQUIRED,
        guestTokenHash,
        guestTokenExpiresAt,
      };
      
      if (!event.isPaid) {
          registrationData.status = REGISTRATION_STATUS.REGISTERED;
      }

      const registration = new mongoose.model('Registration')(registrationData);
      await registration.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        paymentRequired: event.isPaid,
        registration,
        participantCount,
        amount: event.registrationFee,
        currency: event.currency || "INR",
        isRetry: false,
        guestToken: rawToken,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } else {
    // Individual Event Duplicate Check
    const existingRegistration = await registrationRepository.findActiveByEmailAndEvent(participantEmail, event._id);

    if (existingRegistration) {
      throw new ApiError("You are already registered for this event.", HTTP_STATUS.CONFLICT);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const guestTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const guestTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const registrationData = {
      user: null,
      participantName,
      participantEmail,
      participantPhone,
      collegeId,
      department,
      yearOfStudy,
      event: event._id,
      festival: getFestivalId(event),
      team: null,
      status: event.isPaid ? REGISTRATION_STATUS.PENDING : REGISTRATION_STATUS.REGISTERED,
      paymentStatus: event.isPaid ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.NOT_REQUIRED,
      guestTokenHash,
      guestTokenExpiresAt,
    };

    const registration = await registrationRepository.create(registrationData);

    return {
      paymentRequired: event.isPaid,
      registration,
      participantCount: 1,
      amount: event.registrationFee,
      currency: event.currency || "INR",
      isRetry: false,
      guestToken: rawToken,
    };
  }
};

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const retryTicketGeneration = async (registrationId) => {
  const Registration = mongoose.model("Registration");
  const Ticket = mongoose.model("Ticket");

  const registration = await Registration.findById(registrationId)
    .populate("event")
    .populate({
      path: "team",
      populate: { path: "members" }
    });

  if (!registration) {
    throw new ApiError("Registration not found.", HTTP_STATUS.NOT_FOUND);
  }

  if (registration.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw new ApiError("Cannot generate tickets for unpaid registration.", HTTP_STATUS.BAD_REQUEST);
  }

  // Generate or fetch existing tickets
  const ticketService = await import("../services/ticket.service.js");
  const tickets = await ticketService.default.createTicketsForRegistration(registration._id);

  // Re-send emails
  try {
    const emailPromises = tickets.map(async (ticket) => {
      if (ticket._isRecovered) {
        return; // Skip sending duplicate email for a ticket that already existed
      }
      
      let recipientEmail = null;
      let participantName = null;
      if (registration.event.type === EVENT_TYPES.INDIVIDUAL) {
        recipientEmail = registration.participantEmail;
        participantName = registration.participantName || "Participant";
      } else if (registration.event.type === EVENT_TYPES.TEAM && ticket.teamMemberId) {
        const member = registration.team.members.id(ticket.teamMemberId);
        if (member) {
          recipientEmail = member.participantEmail;
          participantName = member.participantName || "Team Member";
        }
      }

      if (recipientEmail) {
        await emailUtil.sendRegistrationConfirmation(
          recipientEmail,
          {
            eventName: registration.event.name,
            festivalName: registration.event.festival ? "Festival" : "",
            participantName,
            registrationId: registration._id,
            qrCode: ticket.qrCode,
          }
        );
      }
    });

    await Promise.all(emailPromises);
    logger.info(`Recovery: Registration confirmation emails sent successfully for registration ${registration._id}.`);
  } catch (emailError) {
    logger.error(
      `Recovery: Failed to send registration confirmation emails for registration ${registration._id}:`,
      emailError
    );
    throw new ApiError("Tickets created/fetched, but emails failed to send.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return { ticketsCount: tickets.length };
};

const registrationService =
  Object.freeze({
    createRegistration,
    createPublicRegistration,

    getAllRegistrations,
    getRegistrationById,

    getMyRegistrations,
    getRegistrationsByEvent,
    getRegistrationsByFestival,
    getRegistrationsByTeam,

    cancelRegistration,

    updateRegistrationStatus,
    updatePaymentStatus,

    getPaymentByRegistration,
    approveRegistration,
    rejectRegistration,

    checkInRegistration,

    deleteRegistration,
    retryTicketGeneration,
  });

export default registrationService;