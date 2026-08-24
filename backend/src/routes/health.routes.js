import { Router } from 'express';
import { ApiResponse } from '../utils/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(true, 'Scintillace API is running', { status: 'ok' }));
});

export default router;
