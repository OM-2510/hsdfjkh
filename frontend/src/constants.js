export const MIN_DAY = "2026-01-02";
export const MAX_DAY = "2026-02-01";

export function isValidDay(value) {
    return value >= MIN_DAY && value <= MAX_DAY
  }