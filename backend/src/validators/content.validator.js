import { body, param, query } from "express-validator";

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const pagination = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];
const identifier = [
  param("id").isMongoId().withMessage("Invalid resource ID."),
];
const statusAndOrder = [
  body("status").optional().isIn(statuses),
  body("displayOrder").optional().isInt({ min: 0 }),
];

const sponsorFields = [
  body("name").trim().notEmpty().isLength({ max: 150 }),
  body("tier").optional().trim().isLength({ max: 80 }),
  body("logoUrl").trim().isURL(),
  body("websiteUrl").optional({ values: "falsy" }).trim().isURL(),
  body("description").optional().trim().isLength({ max: 1000 }),
  ...statusAndOrder,
];
const sponsorUpdate = [
  body("name").optional().trim().notEmpty().isLength({ max: 150 }),
  body("tier").optional().trim().isLength({ max: 80 }),
  body("logoUrl").optional().trim().isURL(),
  body("websiteUrl").optional({ values: "falsy" }).trim().isURL(),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("status").optional().isIn(statuses),
  body("displayOrder").optional().isInt({ min: 0 }),
];
const faqFields = [
  body("question").trim().notEmpty().isLength({ max: 500 }),
  body("answer").trim().notEmpty().isLength({ max: 5000 }),
  body("category").optional().trim().isLength({ max: 80 }),
  ...statusAndOrder,
];
const faqUpdate = [
  body("question").optional().trim().notEmpty().isLength({ max: 500 }),
  body("answer").optional().trim().notEmpty().isLength({ max: 5000 }),
  body("category").optional().trim().isLength({ max: 80 }),
  body("status").optional().isIn(statuses),
  body("displayOrder").optional().isInt({ min: 0 }),
];

export {
  pagination,
  identifier,
  sponsorFields,
  sponsorUpdate,
  faqFields,
  faqUpdate,
  statuses,
};
