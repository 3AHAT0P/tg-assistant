import { InjectionToken, provide } from '#lib/DI';
import { typeKey } from '#utils';

import { type UserRepository, getUserRepository } from './repository';

export const UserRepositoryInjectionToken: InjectionToken<UserRepository> = {
  id: Symbol('UserRepository'),
  guard(value: unknown): value is UserRepository {
    return typeof value === 'object' && value != null && typeKey in value && value[typeKey] === 'UserRepository';
  },
};

export const provider = async (): Promise<void> => {
  const repository = getUserRepository();

  provide(UserRepositoryInjectionToken, repository);
};
