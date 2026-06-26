function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function uniqueStrings(values) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function isOffValue(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'off' || normalized === 'false' || normalized === '0';
}

export {
  numberOrNull,
  round,
  uniqueStrings,
  positiveInteger,
  isOffValue,
};
