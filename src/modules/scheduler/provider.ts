import { InjectionToken, inject, provide } from '#lib/DI';
import { configInjectionToken } from '#module/config';
import { checker } from './checker';

interface Scheduler {
  stop(): void;
}

export const schedulerInjectionToken: InjectionToken<Scheduler> = {
  id: Symbol('Scheduler'),
  guard(value: unknown): value is Scheduler {
    return typeof value === 'object' && value != null && 'stop' in value;
  },
};

export const provider = async (): Promise<void> => {
  const config = inject(configInjectionToken);

  let timer: NodeJS.Timeout | null = null;

  const start = () => {
    checker();
    timer = setTimeout(checker, config.scheduleRunDelay);
  };

  const stop = () => {
    if (timer === null) return;
    clearTimeout(timer);
  };

  start();

  provide(schedulerInjectionToken, { stop });
};
