import { Router } from 'express';

import festivalController from '../controllers/festival.controller.js';
import {
  createFestivalValidator,
  updateFestivalValidator,
  festivalIdValidator,
} from '../validators/festival.validator.js';

import validateRequest from '../middlewares/validateRequest.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

/**
 * Public Routes
 */

// Get all festivals
router.get(
  '/',
  festivalController.getAllFestivals,
);

// Get festival by ID
router.get(
  '/:id',
  festivalIdValidator,
  validateRequest,
  festivalController.getFestivalById,
);

/**
 * Protected Routes
 */

// Create Festival
router.post(
  '/',
  authenticate,
  createFestivalValidator,
  validateRequest,
  festivalController.createFestival,
);

// Update Festival
router.put(
  '/:id',
  authenticate,
  updateFestivalValidator,
  validateRequest,
  festivalController.updateFestival,
);

// Delete Festival
router.delete(
  '/:id',
  authenticate,
  festivalIdValidator,
  validateRequest,
  festivalController.deleteFestival,
);

export default router;