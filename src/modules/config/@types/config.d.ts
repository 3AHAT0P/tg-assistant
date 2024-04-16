export interface Config {
  readonly isProdMode: boolean;
  readonly logLevel: number;
  readonly tgBotToken: string;
  readonly scheduleRunDelay: number;
  readonly defaultTimezone: string;
  readonly defaultLocale: string;
  readonly postgres: {
    host: string;
    port: number;
    db: string;
    user: string;
    password: string;
    runMigrations: boolean;
    rollbackMigrations: number;
  };
  readonly self: {
    readonly host: string;
    readonly port: number;
    readonly publicHost: string;
    readonly publicPort: number | null;
  };
}
