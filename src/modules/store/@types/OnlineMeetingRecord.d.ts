import type { ScheduleWeekDayRecord, ScheduleDateRecord } from './ScheduleRecord';

export interface OnlineMeetingRecord {
  id: string;
  name: string;
  link: string;
  schedule: ScheduleWeekDayRecord | ScheduleDateRecord;
  repeat: 'workdays' | 'weekly' | 'monthly' | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
