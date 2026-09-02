const GROUP_BY_VALUES = ['DAY', 'WEEK', 'MONTH'];

export function validateAnalyticsQuery(query = {}) {
  const errors = {};
  const normalizedData = {};
  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
  const dateTo = query.dateTo ? new Date(query.dateTo) : null;
  const preset = query.preset ? getDateRangePreset(query.preset) : null;

  if (query.preset && !preset) errors.preset = 'preset must be today, yesterday, week, month, or year';

  if (dateFrom && Number.isNaN(dateFrom.getTime())) errors.dateFrom = 'dateFrom must be a valid date';
  if (dateTo && Number.isNaN(dateTo.getTime())) errors.dateTo = 'dateTo must be a valid date';
  if (dateFrom && dateTo && dateFrom > dateTo) errors.dateRange = 'dateFrom must be before or equal to dateTo';
  if (dateFrom) normalizedData.dateFrom = dateFrom;
  if (dateTo) normalizedData.dateTo = dateTo;
  if (preset && !dateFrom && !dateTo) Object.assign(normalizedData, preset);

  const groupBy = String(query.groupBy || '').trim().toUpperCase();
  if (groupBy && !GROUP_BY_VALUES.includes(groupBy)) errors.groupBy = 'groupBy must be DAY, WEEK, or MONTH';
  normalizedData.groupBy = groupBy || 'MONTH';
  normalizedData.farmId = typeof query.farmId === 'string' && query.farmId.trim() ? query.farmId.trim() : undefined;
  normalizedData.category = typeof query.category === 'string' && query.category.trim() ? query.category.trim().toUpperCase() : undefined;
  normalizedData.product = typeof query.product === 'string' && query.product.trim() ? query.product.trim() : undefined;
  normalizedData.page = Math.max(1, Number(query.page) || 1);
  normalizedData.limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function getDateRangePreset(preset, now = new Date()) {
  const current = new Date(now);
  const start = new Date(current);
  const end = new Date(current);
  end.setHours(23, 59, 59, 999);
  const key = String(preset || '').trim().toLowerCase();

  if (key === 'today') start.setHours(0, 0, 0, 0);
  else if (key === 'yesterday') {
    start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
  } else if (key === 'week' || key === 'this_week') {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0);
  } else if (key === 'month' || key === 'this_month') {
    start.setDate(1); start.setHours(0, 0, 0, 0);
  } else if (key === 'year' || key === 'this_year') {
    start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
  } else return null;
  return { dateFrom: start, dateTo: end };
}

export function percentageChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function profitabilityStatus(netProfit, revenue) {
  if (netProfit < 0) return 'LOSS';
  if (revenue > 0 && netProfit / revenue < 0.1) return 'MANAGEABLE';
  return 'PROFIT';
}
