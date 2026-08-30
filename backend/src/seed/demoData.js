/**
 * ============================================================
 * Scintillace 2K26 Demo / Seed Data
 * ============================================================
 *
 * Source:
 * Official Scintillace 2K26 brochure
 *
 * Important:
 * - Official information is included where available.
 * - Unannounced information is intentionally left empty.
 * - Student coordinators will be added later.
 * - Faculty coordinators are not stored here.
 * - Exact event timings are handled by the Schedule module.
 * - Venues are intentionally left empty until finalized.
 */

export const festivalData = {
  title: "Scintillace 2K26",

  description:
    "Scintillace 2K26 is the flagship technical festival of the Department of Electronics and Communication Engineering, bringing together innovation, creativity, and technical excellence through presentations, workshops, exhibitions, quizzes, and exciting spot events.",

  theme: "Engineering the Future",

  startDate:
    new Date("2026-09-29"),

  endDate:
    new Date("2026-09-30"),

  venue:
    "JNTUA College of Engineering, Pulivendula",

  status: "PUBLISHED",

  bannerUrl:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",

  registrationOpen: true,
};

/**
 * ============================================================
 * Common Presentation Topics
 * ============================================================
 *
 * Taken from the official brochure.
 */

const PRESENTATION_TOPICS = [
  "VLSI / Embedded Systems",
  "Analog / Digital Communications",
  "Artificial Intelligence",
  "IoT / Robotics",
  "Micro / Nano / Integrated Technologies",
  "Any Other Advanced Topics",
];

/**
 * ============================================================
 * Events
 * ============================================================
 */

export const demoEvents = [
  /**
   * ==========================================================
   * 1. EMBEDDED & IoT WITH AI WORKSHOP
   * ==========================================================
   */

  {
    title:
      "Embedded & IoT with AI Workshop",

    description:
      "A hands-on workshop focused on Embedded Systems, Internet of Things, and Artificial Intelligence, designed to provide participants with practical exposure to emerging technologies.",

    category:
      "WORKSHOP",

    type:
      "INDIVIDUAL",

    registrationMode:
      "PAID",

    registrationRequired:
      true,

    maxParticipants:
      null,

    teamSize:
      1,

    isPaid:
      true,

    registrationFee:
      600,

    currency:
      "INR",

    /**
     * Date is known.
     * Exact timing will be handled by Schedule.
     */

    startDateTime:
      new Date("2026-09-30"),

    endDateTime:
      null,

    registrationDeadline:
      null,

    /**
     * Venue intentionally left empty.
     */

    venue:
      "",

    prizePool:
      "Exciting Prizes",

    poster:
      "",

    banner:
      "",

    gallery:
      [],

    eligibility:
      "",

    highlights: [
  "Hands-on learning experience",
  "Embedded Systems and IoT",
  "Artificial Intelligence",
  "Practical exposure to emerging technologies",
],

requirements: [],

rules: [
  "Participants must carry their college ID card.",
  "Maintain discipline and follow the instructions of organizers.",
  "No hardware/components will be provided by organizers.",
  "Any misconduct may lead to disqualification.",
  "Decision of the organizers will be final and binding.",
],

speaker: {
  name: "",
  designation: "",
  organization: "",
},

coordinators: [],

status: "PUBLISHED",

registrationOpen: true,
  },

  /**
   * ==========================================================
   * 2. PAPER PRESENTATION
   * ==========================================================
   */

  {
    title:
      "Paper Presentation",

    description:
      "Present your research, technical ideas, projects, and innovations through an engaging paper presentation.",

    category:
      "TECHNICAL",

    type:
      "TEAM",

    registrationMode:
      "PAID",

    registrationRequired:
      true,

    maxParticipants:
      null,

    /**
     * Official brochure:
     * Maximum two participants per paper.
     */

    teamSize:
      2,

    isPaid:
      true,

    registrationFee:
      200,

    currency:
      "INR",

    startDateTime:
      new Date("2026-09-29"),

    endDateTime:
      null,

    registrationDeadline:
      new Date("2026-09-23"),

    venue:
      "",

    prizePool:
      "Exciting Prizes",

    poster:
      "",

    banner:
      "",

    gallery:
      [],

    eligibility:
      "",

    highlights: [
      "Present technical ideas and research",
      "Showcase innovative concepts",
      "Topics covering emerging engineering technologies",
      ...PRESENTATION_TOPICS,
    ],

    requirements: [
      "Paper must be submitted in IEEE format.",
    ],

    rules: [
      "A maximum of two participants are allowed per paper.",
      "The paper must be submitted in IEEE format.",
      "The maximum number of papers that can be submitted is six.",
      "The last date for paper submission is 23 September 2026.",
      "Registration fee is ₹200 per team.",
    ],

    speaker: {
      name:
        "",

      designation:
        "",

      organization:
        "",
    },

    coordinators:
      [],

    status:
      "PUBLISHED",

    registrationOpen:
      true,
  },

  /**
   * ==========================================================
   * 3. POSTER PRESENTATION
   * ==========================================================
   */

  {
    title:
      "Poster Presentation",

    description:
      "Showcase your ideas, research, projects, and technical work through a visually engaging poster presentation.",

    category:
      "TECHNICAL",

    type:
      "TEAM",

    registrationMode:
      "PAID",

    registrationRequired:
      true,

    maxParticipants:
      null,

    /**
     * Official brochure:
     * Maximum two participants per poster.
     */

    teamSize:
      2,

    isPaid:
      true,

    registrationFee:
      200,

    currency:
      "INR",

    startDateTime:
      new Date("2026-09-29"),

    endDateTime:
      null,

    registrationDeadline:
      new Date("2026-09-23"),

    venue:
      "",

    prizePool:
      "Exciting Prizes",

    poster:
      "",

    banner:
      "",

    gallery:
      [],

    eligibility:
      "",

    highlights: [
      "Visual presentation of technical ideas",
      "Showcase research and innovation",
      "Explore emerging engineering technologies",
      ...PRESENTATION_TOPICS,
    ],

    requirements: [
      "Poster must be submitted by 23 September 2026.",
    ],

    rules: [
      "A maximum of two participants are allowed per poster.",
      "The last date for poster submission is 23 September 2026.",
      "Registration fee is ₹200 per team.",
    ],

    speaker: {
      name:
        "",

      designation:
        "",

      organization:
        "",
    },

    coordinators:
      [],

    status:
      "PUBLISHED",

    registrationOpen:
      true,
  },

  /**
   * ==========================================================
   * 4. HARDWARE EXPO
   * ==========================================================
   */

  {
    title:
      "Hardware Expo",

    description:
      "Showcase innovative hardware projects, engineering solutions, prototypes, and creative ideas in electronics and emerging technologies.",

    category:
      "TECHNICAL",

    type:
      "TEAM",

    registrationMode:
      "PAID",

    registrationRequired:
      true,

    maxParticipants:
      null,

    /**
     * Official brochure refers to this as
     * project presentation and allows up to
     * three participants per project.
     */

    teamSize:
      3,

    isPaid:
      true,

    registrationFee:
      300,

    currency:
      "INR",

    startDateTime:
      new Date("2026-09-29"),

    endDateTime:
      null,

    registrationDeadline:
      null,

    venue:
      "",

    prizePool:
      "Exciting Prizes",

    poster:
      "",

    banner:
      "",

    gallery:
      [],

    eligibility:
      "",

    highlights: [
      "Hardware project showcase",
      "Engineering prototypes",
      "Innovation and creative solutions",
      "Practical implementation of engineering concepts",
    ],

    requirements: [],

    rules: [
      "A maximum of three participants are allowed per project presentation.",
      "Registration fee is ₹300 per team.",
    ],

    speaker: {
      name:
        "",

      designation:
        "",

      organization:
        "",
    },

    coordinators:
      [],

    status:
      "PUBLISHED",

    registrationOpen:
      true,
  },

  /**
   * ==========================================================
   * 5. TECHNICAL QUIZ
   * ==========================================================
   */

  {
    title:
      "Technical Quiz",

    description:
      "Test your technical knowledge, logical thinking, and problem-solving abilities in an engaging individual quiz.",

    category:
      "TECHNICAL",

    type:
      "INDIVIDUAL",

    /**
     * Officially no online registration.
     */

    registrationMode:
      "NONE",

    registrationRequired:
      false,

    maxParticipants:
      null,

    teamSize:
      1,

    isPaid:
      false,

    registrationFee:
      0,

    currency:
      "INR",

    /**
     * Date and timing are not provided
     * in the current brochure data.
     */

    startDateTime:
      null,

    endDateTime:
      null,

    registrationDeadline:
      null,

    venue:
      "",

    prizePool:
      "Exciting Prizes",

    poster:
      "",

    banner:
      "",

    gallery:
      [],

    eligibility:
      "",

    highlights: [
      "Individual participation",
      "Test your technical knowledge",
      "Challenge your logical thinking",
      "Exciting prizes",
    ],

    requirements:
      [],

    /**
     * The brochure does not specify
     * detailed quiz rules.
     */

    rules:
      [],

    speaker: {
      name:
        "",

      designation:
        "",

      organization:
        "",
    },

    coordinators:
      [],

    status:
      "PUBLISHED",

    registrationOpen:
      false,
  },

  /**
   * ==========================================================
   * 6. SPOT EVENTS
   * ==========================================================
   */

  {
    title:
      "Spot Events",

    description:
      "Take part in exciting individual spot events that challenge creativity, skills, presence of mind, and enthusiasm.",

    category:
      "OTHER",

    type:
      "INDIVIDUAL",

    /**
     * No online registration.
     */

    registrationMode:
      "NONE",

    registrationRequired:
      false,

    maxParticipants:
      null,

    teamSize:
      1,

    isPaid:
      false,

    registrationFee:
      0,

    currency:
      "INR",

    startDateTime:
      null,

    endDateTime:
      null,

    registrationDeadline:
      null,

    venue:
      "",

    prizePool:
      "Exciting Prizes",

    poster:
      "",

    banner:
      "",

    gallery:
      [],

    eligibility:
      "",

    highlights: [
      "Individual participation",
      "Exciting on-the-spot activities",
      "Creativity and presence of mind",
      "Exciting prizes",
    ],

    requirements:
      [],

    /**
     * No specific Spot Event rules are
     * mentioned in the brochure.
     */

    rules:
      [],

    speaker: {
      name:
        "",

      designation:
        "",

      organization:
        "",
    },

    coordinators:
      [],

    status:
      "PUBLISHED",

    registrationOpen:
      false,
  },
];