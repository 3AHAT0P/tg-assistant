/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { buildLogMessage } from './buildLogMessage';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  QUIET = 4,
}

export interface LoggerOptions {
  mode?: LogLevel;
  prefix?: string;
  postfix?: string;
}

export class Logger {
  private _context: Console;

  private _mode: LogLevel;

  private _prefix: string;

  private _postfix: string;

  public get mode(): LogLevel {
    return this._mode;
  }

  public set mode(value: LogLevel) {
    this._mode = value;
  }

  constructor(options: LoggerOptions = {}) {
    this._context = console;

    this._mode = options.mode ?? LogLevel.ERROR;
    this._prefix = options.prefix ?? '';
    this._postfix = options.postfix ?? '';
  }

  public debug(placement: string[], message: string): void {
    if (this._mode <= LogLevel.DEBUG) this._context.log(buildLogMessage(`DEBUG => ${this._prefix}`, placement, message, this._postfix));
  }

  public info(placement: string[], message: string): void {
    if (this._mode <= LogLevel.INFO) this._context.info(buildLogMessage(`INFO => ${this._prefix}`, placement, message, this._postfix));
  }

  public warn(placement: string[], message: string): void {
    if (this._mode <= LogLevel.WARN) this._context.warn(buildLogMessage(`WARN => ${this._prefix}`, placement, message, this._postfix));
  }

  public error(placement: string[], message: string): void {
    if (this._mode <= LogLevel.ERROR) this._context.error(buildLogMessage(`ERROR => ${this._prefix}`, placement, message, this._postfix));
  }

  public catchAndLogError(placement: string[], promise: Promise<any>): void {
    promise.catch((error: any) => this.error(placement, error?.toString() ?? ''));
  }
}
