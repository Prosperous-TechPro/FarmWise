import express from 'express';
import { completeOnboarding, getOnboarding, sendOnboardingOtp } from '../controllers/workerOnboardingController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.get('/:token', asyncHandler(getOnboarding));
router.post('/:token/send-otp', asyncHandler(sendOnboardingOtp));
router.post('/:token/complete', asyncHandler(completeOnboarding));
export default router;
