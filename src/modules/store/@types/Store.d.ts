import type { ValueOf } from '#utils/@types';

import type { saveResult } from '../saveResult';

import type { Model } from './Model';

export interface Store<TModel extends Model> {
  getAllRecords(): Promise<IterableIterator<TModel>>;
  getRecordById(id: TModel['id']): Promise<TModel | null>;
  saveRecordById(id: TModel['id'], data: TModel): Promise<ValueOf<typeof saveResult>>;
  deleteRecordById(id: string): Promise<void>
  saveStoreToDisk(): Promise<void>;
  readStoreFromDisk(): Promise<void>;
}
