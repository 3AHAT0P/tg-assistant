import { InjectionToken, provide } from '#lib/DI';

import { Store } from '../@types/Store';

import { OnlineMeetingRecord } from './@types/OnlineMeetingRecord';
import { init } from './store';

export const onlineMeetingStoreInjectionToken: InjectionToken<Store<OnlineMeetingRecord>> = {
  id: Symbol('OnlineMeetingRecordStore'),
  guard(value: unknown): value is Store<OnlineMeetingRecord> {
    return typeof value === 'object' && value != null && 'getRecordById' in value && 'saveRecordById' in value;
  },
};

export const provider = async (): Promise<void> => {
  const bot = await init();

  provide(onlineMeetingStoreInjectionToken, bot);
};