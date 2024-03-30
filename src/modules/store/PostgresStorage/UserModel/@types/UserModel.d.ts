export interface UserModel {
  id: string;
  firstName: string;
  lastName: string | null;
  tgId: string;
  createdAt: Date;
  updatedAt: Date;
}
