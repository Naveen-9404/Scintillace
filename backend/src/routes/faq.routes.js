import { Router } from "express";
import faqController from "../controllers/faq.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";
import ROLES from "../constants/roles.js";
import {
  pagination,
  identifier,
  faqFields,
  faqUpdate,
} from "../validators/content.validator.js";

const router = Router();
const admin = [authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.FACULTY)];
router.get(
  "/published",
  [...pagination],
  validateRequest,
  faqController.published,
);
router.get("/", ...admin, pagination, validateRequest, faqController.all);
router.get("/:id", ...admin, identifier, validateRequest, faqController.byId);
router.post("/", ...admin, faqFields, validateRequest, faqController.create);
router.put(
  "/:id",
  ...admin,
  identifier,
  faqUpdate,
  validateRequest,
  faqController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  identifier,
  validateRequest,
  faqController.remove,
);
export default router;
