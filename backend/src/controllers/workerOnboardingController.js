import * as onboardingService from '../services/workerOnboardingService.js';

export async function getOnboarding(req, res) { return res.json({ success: true, data: await onboardingService.getOnboarding(req.params.token) }); }
export async function sendOnboardingOtp(req, res) { return res.json({ success: true, data: await onboardingService.sendOnboardingOtp(req.params.token, req) }); }
export async function completeOnboarding(req, res) { const { code, newPassword, confirmPassword } = req.body; return res.json({ success: true, data: await onboardingService.completeOnboarding(req.params.token, code, newPassword, confirmPassword, req) }); }
