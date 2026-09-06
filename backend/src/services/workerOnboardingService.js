import { createAuditLog } from '../repositories/auditRepository.js';
import { createGlobalNotification } from '../repositories/supportRepository.js';
import { createWorkerAccount, findActiveOnboardingByUser, findOnboardingByToken, findUserByEmail, findUserByPhone, rotateWorkerOnboardingToken, updateWorkerOnboarding } from '../repositories/workerOnboardingRepository.js';
import { getFarmById } from '../repositories/farmRepository.js';
import { hashPassword, hashValue, generateToken, validatePasswordStrength } from '../utils/crypto.js';
import { generateAndSendOtp, verifyOtp } from './otpService.js';
import { validateWorkerRegistration } from '../validators/workerOnboardingValidator.js';
import { updatePasswordHash, updateUser } from '../repositories/userRepository.js';

function invalid(validation) { if (validation.isValid) return; const error = new Error('Validation failed'); error.statusCode = 400; error.details = validation.errors; throw error; }

export async function registerWorker(farmerId, farmId, input, req) {
  const farm = await getFarmById(farmId);
  if (!farm || farm.ownerId !== farmerId) { const error = new Error('You are not authorized to register workers for this farm'); error.statusCode = 403; throw error; }
  const validation = validateWorkerRegistration(input); invalid(validation);
  const { firstName, lastName, phone, email } = validation.normalizedData;
  if (await findUserByPhone(phone)) { const error = new Error('Worker phone number is already registered'); error.statusCode = 409; throw error; }
  if (email && await findUserByEmail(email)) { const error = new Error('Worker email address is already registered'); error.statusCode = 409; throw error; }
  const temporaryPassword = generateToken(12);
  const syntheticEmail = email || `${phone.replace(/\D/g, '')}@worker.farmwise.local`;
  const token = generateToken(32);
  const result = await createWorkerAccount({ user: { email: syntheticEmail, phone, firstName, lastName, passwordHash: await hashPassword(temporaryPassword), status: 'ACTIVE', emailVerified: Boolean(email), phoneVerified: false }, farmId, createdById: farmerId, tokenHash: hashValue(token) });
  await createAuditLog({ farmId, userId: farmerId, action: 'WORKER_REGISTERED_BY_FARMER', entityType: 'User', entityId: result.user.id, req, newValues: { workerId: result.user.id, farmId, phone } });
  await createGlobalNotification({ userId: farmerId, type: 'WORKER_REGISTERED', title: 'Worker registered successfully', message: `${firstName} ${lastName} was added to ${farm.name}.`, relatedEntityType: 'USER', relatedEntityId: result.user.id });
  return { worker: { id: result.user.id, firstName, lastName, phone, email: email || null, farm: farm.name, status: 'ACTIVE', onboardingStatus: 'PHONE_VERIFICATION_REQUIRED' }, temporaryPassword, onboardingToken: token };
}

export async function getOnboarding(token) {
  const onboarding = await findOnboardingByToken(hashValue(token));
  if (!onboarding) { const error = new Error('Onboarding link is invalid or expired'); error.statusCode = 401; throw error; }
  return { worker: onboarding.user, farm: onboarding.farm, status: onboarding.status };
}

export async function sendOnboardingOtp(token, req) {
  const onboarding = await findOnboardingByToken(hashValue(token));
  if (!onboarding) { const error = new Error('Onboarding link is invalid or expired'); error.statusCode = 401; throw error; }
  await generateAndSendOtp({ userId: onboarding.userId, purpose: 'CHANGE_PHONE', channel: 'SMS', destination: onboarding.user.phone, smsProvider: req.app.get('smsProvider'), emailProvider: req.app.get('emailProvider'), expiryMinutes: 10, length: 6 });
  await createAuditLog({ farmId: onboarding.farmId, userId: onboarding.userId, action: 'WORKER_OTP_SENT', entityType: 'WorkerOnboarding', entityId: onboarding.id, req });
  return { message: 'Verification code sent to the registered phone number.' };
}

export async function completeOnboarding(token, code, newPassword, confirmPassword, req) {
  const onboarding = await findOnboardingByToken(hashValue(token));
  if (!onboarding) { const error = new Error('Onboarding link is invalid or expired'); error.statusCode = 401; throw error; }
  if (newPassword !== confirmPassword) { const error = new Error('Passwords do not match'); error.statusCode = 400; throw error; }
  const passwordValidation = validatePasswordStrength(newPassword); if (!passwordValidation.isValid) { const error = new Error(passwordValidation.errors[0]); error.statusCode = 400; throw error; }
  await verifyOtp({ userId: onboarding.userId, purpose: 'CHANGE_PHONE', channel: 'SMS', code });
  await updatePasswordHash(onboarding.userId, await hashPassword(newPassword));
  await updateUser(onboarding.userId, { phoneVerified: true, phoneVerifiedAt: new Date(), status: 'ACTIVE' });
  await updateWorkerOnboarding(onboarding.id, { status: 'COMPLETED', phoneVerifiedAt: new Date(), completedAt: new Date() });
  await createAuditLog({ farmId: onboarding.farmId, userId: onboarding.userId, action: 'WORKER_ONBOARDING_COMPLETED', entityType: 'WorkerOnboarding', entityId: onboarding.id, req });
  return { message: 'Worker onboarding completed. You can now sign in.', farm: onboarding.farm };
}

export async function getActiveWorkerOnboarding(userId) { return findActiveOnboardingByUser(userId); }
