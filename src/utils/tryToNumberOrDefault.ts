import type { Hours, Minutes, MonthDayIndex, MonthIndex, WeekDayIndex, WeekIndex } from '#utils/@types/DateTime';

export const tryToNumberOrDefault = (value: string, defaultValue: number): number => {
  if (value === '') return defaultValue;

  const result = Number(value);
  if (Number.isNaN(result)) return defaultValue;

  return result;
};

export const validateNumberOrDefault = <T extends number>(
  value: string,
  validator: (value: number) => value is T,
  defaultValue: T,
): T => {
  if (value === '') return defaultValue;

  const result = Number(value);
  if (Number.isNaN(result)) return defaultValue;

  if (validator(result)) return result;

  return defaultValue;
};

export const isMonthIndex = (value: number): value is MonthIndex => value >= 1 && value <= 12;
export const isMonthDayIndex = (value: number): value is MonthDayIndex => value >= 1 && value <= 31;
export const isWeekIndex = (value: number): value is WeekIndex => value >= 1 && value <= 53;
export const isWeekDayIndex = (value: number): value is WeekDayIndex => value >= 1 && value <= 7;
export const isHours = (value: number): value is Hours => value >= 0 && value <= 23;
export const isMinutes = (value: number): value is Minutes => value >= 0 && value <= 59;
