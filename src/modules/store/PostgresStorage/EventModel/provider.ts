import { InjectionToken, provide } from '#lib/DI';
import { typeKey } from '#utils';

import { type EventRepository, getEventRepository } from './repository';

export const EventRepositoryInjectionToken: InjectionToken<EventRepository> = {
  id: Symbol('EventRepository'),
  guard(value: unknown): value is EventRepository {
    return typeof value === 'object' && value != null && typeKey in value && value[typeKey] === 'EventRepository';
  },
};

export const provider = async (): Promise<void> => {
  const repository = getEventRepository();

  provide(EventRepositoryInjectionToken, repository);
};
