import { Api, Bot, Context, RawApi } from 'grammy';

export type TGBotContext = Context;

export type TGBot = Bot<TGBotContext, Api<RawApi>>;
