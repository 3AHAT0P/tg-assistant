const container: Record<string | symbol, unknown> = {};

export interface InjectionToken<TProvider = unknown> {
  id: string | symbol;
  guard(value: unknown): value is TProvider;
}

export const inject = <InjectionType>(token: InjectionToken<InjectionType>): InjectionType => {
  if (token.id in container) {
    const provider = container[token.id];
    if (token.guard(provider)) return provider;
    throw new Error('Token or provider is invalid!');
  }

  throw new Error('Token is not registered!');
};

export const provide = <InjectionType>(token: InjectionToken<InjectionType>, value: InjectionType): void => {
  container[token.id] = value;
};
