export interface EventModel {
  id: string;
  name: string;
  link: string;
  startAt: Date;
  repeat: 'workdays' | 'weekly' | 'monthly' | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
