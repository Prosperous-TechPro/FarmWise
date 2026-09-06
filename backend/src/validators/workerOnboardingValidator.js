import { normalizePhoneNumber } from '../utils/phone.js';

export function validateWorkerRegistration(input = {}) {
  const errors = {};
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim().replace(/\s+/g, ' ') : '';
  const email = input.email === undefined || input.email === '' ? null : String(input.email).trim().toLowerCase();
  const phone = typeof input.phone === 'string' ? normalizePhoneNumber(input.phone) : { isValid: false, error: 'Phone number is required' };

  if (fullName.length < 3 || fullName.length > 100 || !/^[\p{L}][\p{L}\s'.-]+$/u.test(fullName)) errors.fullName = 'Enter the worker full name using letters only';
  if (!phone.isValid) errors.phone = phone.error || 'Invalid phone number';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';

  const [firstName, ...rest] = fullName.split(' ');
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: { firstName, lastName: rest.join(' ') || firstName, phone: phone.normalizedNumber, email, fullName },
  };
}
