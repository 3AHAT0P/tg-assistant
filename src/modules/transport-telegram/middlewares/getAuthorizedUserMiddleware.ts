import { inject } from '#lib/DI';

import { type UserModel, UserRepositoryInjectionToken } from '#module/store/PostgresStorage/UserModel';
import { UserNotFoundError } from '#utils/errors/UserNotFoundError';

import { TGBotContext } from '../@types';

export const getAuthorizedUserMiddleware = async (context: TGBotContext): Promise<UserModel | UserNotFoundError> => {
  const userTGId = context.from?.id?.toString() ?? null;
  if (userTGId === null) return new UserNotFoundError();

  const userRepository = inject(UserRepositoryInjectionToken);

  const user = await userRepository.findByTGId({ tgId: userTGId, isEnabled: true });
  if (user === null) return new UserNotFoundError();

  return user;
};
