import type { Hours, Minutes, MonthDayIndex, MonthIndex, WeekDayIndex, WeekIndex } from '#utils/@types/DateTime';

export interface ScheduleWeekDayRecord {
  week: {
    year: number;
    weekNumber: WeekIndex;
    day: WeekDayIndex;
    hour: Hours;
    minute: Minutes;
  };
}

export interface ScheduleDateRecord {
  date: {
    year: number;
    month: MonthIndex;
    day: MonthDayIndex;
    hour: Hours;
    minute: Minutes;
  };
}
