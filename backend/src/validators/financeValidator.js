const EXPENSE_CATEGORY_VALUES = [
  'FEED',
  'SEED',
  'FERTILIZER',
  'PESTICIDE',
  'HERBICIDE',
  'MEDICATION',
  'LABOR',
  'EQUIPMENT',
  'MAINTENANCE',
  'UTILITIES',
  'TRANSPORTATION',
  'STORAGE',
  'OTHER',
];

const COST_TYPE_VALUES = ['DIRECT_COST', 'INDIRECT_COST', 'CAPITAL_EXPENDITURE', 'OTHER'];
const PAYMENT_METHOD_VALUES = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'];
const TRANSACTION_STATUS_VALUES = ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED', 'VOIDED'];
const SALE_ITEM_TYPE_VALUES = ['PRODUCE', 'LIVESTOCK', 'INPUT', 'OTHER'];
const LOSS_CATEGORY_VALUES = ['WEATHER', 'DISEASE', 'FEED', 'THEFT', 'SPOILAGE', 'DAMAGE', 'MORTALITY', 'OTHER'];
const BUDGET_PERIOD_VALUES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'];
const CURRENCY_VALUES = ['GHS', 'USD', 'EUR'];

function normalizeEnumValue(value, allowedValues, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return fallback;
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function toDecimalNumber(value, fieldName, errors, allowZero = false) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    errors[fieldName] = `${fieldName} must be a valid number`;
    return undefined;
  }
  if (!allowZero && num <= 0) {
    errors[fieldName] = `${fieldName} must be greater than 0`;
    return undefined;
  }
  return num;
}

function validateDateString(value, fieldName, errors, required = true) {
  if ((value === undefined || value === null || value === '') && !required) return undefined;
  if (value === undefined || value === null || value === '') {
    errors[fieldName] = `${fieldName} is required`;
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors[fieldName] = `${fieldName} must be a valid date`;
    return undefined;
  }

  return date;
}

export function validateCreateExpense(data = {}) {
  const errors = {};
  const normalizedData = {};

  const category = normalizeEnumValue(data.category, EXPENSE_CATEGORY_VALUES, undefined);
  if (!category) {
    errors.category = 'Category is required and must be a valid expense category';
  } else {
    normalizedData.category = category;
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      const description = data.description.trim();
      if (!description) errors.description = 'Description is required';
      else normalizedData.description = description;
    }
  } else {
    errors.description = 'Description is required';
  }

  const amount = toDecimalNumber(data.amount, 'amount', errors);
  if (amount !== undefined) normalizedData.amount = amount;

  const currency = normalizeEnumValue(data.currency, CURRENCY_VALUES, 'GHS');
  if (data.currency !== undefined && currency === 'GHS' && String(data.currency).trim().toUpperCase() !== 'GHS') {
    errors.currency = 'Currency must be one of GHS, USD, or EUR';
  } else {
    normalizedData.currency = currency;
  }

  const costType = normalizeEnumValue(data.costType, COST_TYPE_VALUES, 'DIRECT_COST');
  if (data.costType !== undefined && costType === 'DIRECT_COST' && String(data.costType).trim().toUpperCase() !== 'DIRECT_COST') {
    errors.costType = 'Cost type must be one of DIRECT_COST, INDIRECT_COST, CAPITAL_EXPENDITURE, or OTHER';
  } else {
    normalizedData.costType = costType;
  }

  const paymentMethod = normalizeEnumValue(data.paymentMethod, PAYMENT_METHOD_VALUES, undefined);
  if (data.paymentMethod !== undefined && paymentMethod === undefined) {
    errors.paymentMethod = 'Payment method must be one of CASH, CARD, MOBILE_MONEY, BANK_TRANSFER, CHEQUE, or OTHER';
  } else if (data.paymentMethod !== undefined || !('paymentMethod' in data)) {
    normalizedData.paymentMethod = paymentMethod || 'CASH';
  }

  const status = normalizeEnumValue(data.status, TRANSACTION_STATUS_VALUES, 'CONFIRMED');
  if (data.status !== undefined && status === 'CONFIRMED' && String(data.status).trim().toUpperCase() !== 'CONFIRMED') {
    errors.status = 'Status must be one of DRAFT, CONFIRMED, PAID, CANCELLED, or VOIDED';
  } else {
    normalizedData.status = status;
  }

  const expenseDate = validateDateString(data.expenseDate, 'expenseDate', errors);
  if (expenseDate) normalizedData.expenseDate = expenseDate;

  if (data.expenseTime !== undefined && data.expenseTime !== null && data.expenseTime !== '') {
    const timeValue = new Date(data.expenseTime);
    if (Number.isNaN(timeValue.getTime())) {
      errors.expenseTime = 'Expense time must be a valid date-time value';
    } else {
      normalizedData.expenseTime = timeValue;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateSale(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.saleNumber || !String(data.saleNumber).trim()) {
    errors.saleNumber = 'Sale number is required';
  } else {
    normalizedData.saleNumber = String(data.saleNumber).trim();
  }

  const totalAmount = toDecimalNumber(data.totalAmount, 'totalAmount', errors);
  if (totalAmount !== undefined) normalizedData.totalAmount = totalAmount;

  const currency = normalizeEnumValue(data.currency, CURRENCY_VALUES, 'GHS');
  if (data.currency !== undefined && currency === 'GHS' && String(data.currency).trim().toUpperCase() !== 'GHS') {
    errors.currency = 'Currency must be one of GHS, USD, or EUR';
  } else {
    normalizedData.currency = currency;
  }

  const paymentMethod = normalizeEnumValue(data.paymentMethod, PAYMENT_METHOD_VALUES, 'CASH');
  if (data.paymentMethod !== undefined && paymentMethod === 'CASH' && String(data.paymentMethod).trim().toUpperCase() !== 'CASH') {
    errors.paymentMethod = 'Payment method must be one of CASH, CARD, MOBILE_MONEY, BANK_TRANSFER, CHEQUE, or OTHER';
  } else {
    normalizedData.paymentMethod = paymentMethod;
  }

  const status = normalizeEnumValue(data.status, TRANSACTION_STATUS_VALUES, 'DRAFT');
  if (data.status !== undefined && status === 'DRAFT' && String(data.status).trim().toUpperCase() !== 'DRAFT') {
    errors.status = 'Status must be one of DRAFT, CONFIRMED, PAID, CANCELLED, or VOIDED';
  } else {
    normalizedData.status = status;
  }

  const saleDate = validateDateString(data.saleDate, 'saleDate', errors);
  if (saleDate) normalizedData.saleDate = saleDate;

  if (data.buyer !== undefined) {
    if (typeof data.buyer !== 'string') errors.buyer = 'Buyer must be a string';
    else normalizedData.buyer = data.buyer.trim() || undefined;
  }

  if (data.notes !== undefined) {
    if (typeof data.notes !== 'string') errors.notes = 'Notes must be a string';
    else normalizedData.notes = data.notes.trim() || undefined;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateFinancialLoss(data = {}) {
  const errors = {};
  const normalizedData = {};

  const category = normalizeEnumValue(data.category, LOSS_CATEGORY_VALUES, undefined);
  if (!category) {
    errors.category = 'Category is required and must be a valid financial loss category';
  } else {
    normalizedData.category = category;
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      const description = data.description.trim();
      if (!description) errors.description = 'Description is required';
      else normalizedData.description = description;
    }
  } else {
    errors.description = 'Description is required';
  }

  const lossDate = validateDateString(data.lossDate, 'lossDate', errors);
  if (lossDate) normalizedData.lossDate = lossDate;

  const estimatedValue = toDecimalNumber(data.estimatedValue, 'estimatedValue', errors, true);
  if (estimatedValue !== undefined) normalizedData.estimatedValue = estimatedValue;

  const currency = normalizeEnumValue(data.currency, CURRENCY_VALUES, 'GHS');
  if (data.currency !== undefined && currency === 'GHS' && String(data.currency).trim().toUpperCase() !== 'GHS') {
    errors.currency = 'Currency must be one of GHS, USD, or EUR';
  } else {
    normalizedData.currency = currency;
  }

  const status = normalizeEnumValue(data.status, TRANSACTION_STATUS_VALUES, 'CONFIRMED');
  if (data.status !== undefined && status === 'CONFIRMED' && String(data.status).trim().toUpperCase() !== 'CONFIRMED') {
    errors.status = 'Status must be one of DRAFT, CONFIRMED, PAID, CANCELLED, or VOIDED';
  } else {
    normalizedData.status = status;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateBudget(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.name || !String(data.name).trim()) {
    errors.name = 'Budget name is required';
  } else {
    normalizedData.name = String(data.name).trim();
  }

  const period = normalizeEnumValue(data.period, BUDGET_PERIOD_VALUES, undefined);
  if (!period) {
    errors.period = 'Period is required and must be one of WEEKLY, MONTHLY, QUARTERLY, YEARLY, or CUSTOM';
  } else {
    normalizedData.period = period;
  }

  const startDate = validateDateString(data.startDate, 'startDate', errors);
  if (startDate) normalizedData.startDate = startDate;

  const endDate = validateDateString(data.endDate, 'endDate', errors);
  if (endDate) normalizedData.endDate = endDate;

  const totalBudget = toDecimalNumber(data.totalBudget, 'totalBudget', errors);
  if (totalBudget !== undefined) normalizedData.totalBudget = totalBudget;

  const currency = normalizeEnumValue(data.currency, CURRENCY_VALUES, 'GHS');
  if (data.currency !== undefined && currency === 'GHS' && String(data.currency).trim().toUpperCase() !== 'GHS') {
    errors.currency = 'Currency must be one of GHS, USD, or EUR';
  } else {
    normalizedData.currency = currency;
  }

  const status = normalizeEnumValue(data.status, TRANSACTION_STATUS_VALUES, 'DRAFT');
  if (data.status !== undefined && status === 'DRAFT' && String(data.status).trim().toUpperCase() !== 'DRAFT') {
    errors.status = 'Status must be one of DRAFT, CONFIRMED, PAID, CANCELLED, or VOIDED';
  } else {
    normalizedData.status = status;
  }

  if (normalizedData.startDate && normalizedData.endDate && normalizedData.endDate < normalizedData.startDate) {
    errors.endDate = 'End date must be after or equal to the start date';
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export default {
  validateCreateExpense,
  validateCreateSale,
  validateCreateFinancialLoss,
  validateCreateBudget,
};
