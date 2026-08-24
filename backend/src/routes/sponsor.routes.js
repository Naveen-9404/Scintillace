import { Router } from "express";
import sponsorController from "../controllers/sponsor.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";
import ROLES from "../constants/roles.js";
import {
  pagination,
  identifier,
  sponsorFields,
  sponsorUpdate,
} from "../validators/content.validator.js";

const router = Router();
const admin = [authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.FACULTY)];
router.get(
  "/published",
  pagination,
  validateRequest,
  sponsorController.published,
);
router.get("/", ...admin, pagination, validateRequest, sponsorController.all);
router.get(
  "/:id",
  ...admin,
  identifier,
  validateRequest,
  sponsorController.byId,
);
router.post(
  "/",
  ...admin,
  sponsorFields,
  validateRequest,
  sponsorController.create,
);
router.put(
  "/:id",
  ...admin,
  identifier,
  sponsorUpdate,
  validateRequest,
  sponsorController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  identifier,
  validateRequest,
  sponsorController.remove,
);
export default router;
