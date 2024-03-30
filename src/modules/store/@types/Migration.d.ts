export interface Migration {
  readonly up: (connection: Pool) => Promise<void>;
  readonly down: (connection: Pool) => Promise<void>;
}

export type MigrationList = Array<[name: string, runner: Migration]>;
