export interface Config {
  readonly isProdMode: boolean;
  readonly logLevel: number;
  readonly tgBotToken: string;
  readonly scheduleRunDelay: number;
  readonly defaultTimezone: string;
  readonly defaultLocale: string;
}
