import { randomUUID } from 'crypto';
import type { OnlineMeetingRecord } from './@types/OnlineMeetingRecord';

export const buildOnlineMeetingRecord = (data: Omit<OnlineMeetingRecord, 'id' | 'createdAt' | 'updatedAt'>): OnlineMeetingRecord => {
  return {
    ...data,
    id: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
