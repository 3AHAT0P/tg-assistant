import { Api, Bot, Context, RawApi } from 'grammy';

export type TGBot = Bot<Context, Api<RawApi>>;
