export interface UserModel {
  id: string;
  firstName: string;
  lastName: string | null;
  tgId: string;
  timezone: string | null;
  locale: string | null;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
