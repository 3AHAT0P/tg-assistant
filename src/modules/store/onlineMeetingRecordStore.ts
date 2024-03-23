import { randomUUID } from 'crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ValueOf } from '#utils/@types';
import { isNullOrUndefined } from '#utils';

import type { OnlineMeetingRecord } from './@types/OnlineMeetingRecord';
import type { Store } from './@types/Store';
import { saveResult } from './saveResult';

const storeFilePath = path.join(process.cwd(), 'data', 'OnlineMeetingStore.data.json');

type OnlineMeetingStore = Map<string, OnlineMeetingRecord>;

const getRecordById = async (
  store: OnlineMeetingStore,
  id: OnlineMeetingRecord['id'],
): Promise<OnlineMeetingRecord | null> => {
  const result = store.get(id);
  if (isNullOrUndefined(result)) return Promise.resolve(null);

  return Promise.resolve(result);
};

const getAllRecord = async (
  store: OnlineMeetingStore,
): Promise<IterableIterator<OnlineMeetingRecord>> => {

  return Promise.resolve(store.values());
};

const saveRecordById = async (
  store: OnlineMeetingStore,
  id: OnlineMeetingRecord['id'],
  data: OnlineMeetingRecord,
): Promise<ValueOf<typeof saveResult>> => {
  const isNew = !store.has(id);
  store.set(id, data);

  await saveStoreToDisk(store);

  if (isNew) return Promise.resolve(saveResult.created);

  return Promise.resolve(saveResult.updated);
};

const readStoreFromDisk = async (
  store: OnlineMeetingStore,
): Promise<void> => {
  const data = (await import(storeFilePath, { assert: { type: 'json' } })).default;
  for (const [id, record] of data) {
    store.set(id, record);
  }
};

const saveStoreToDisk = async (
  store: OnlineMeetingStore,
): Promise<void> => {
  await writeFile(storeFilePath, JSON.stringify(Array.from(store.entries()), null, 2));
};

export const buildRecord = (data: Omit<OnlineMeetingRecord, 'id' | 'createdAt' | 'updatedAt'>): OnlineMeetingRecord => {
  return {
    ...data,
    id: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const init = async (): Promise<Store<OnlineMeetingRecord>> => {
  const onlineMeetingStore: OnlineMeetingStore = new Map();

  await readStoreFromDisk(onlineMeetingStore);

  return {
    getAllRecords: getAllRecord.bind(null, onlineMeetingStore),
    getRecordById: getRecordById.bind(null, onlineMeetingStore),
    saveRecordById: saveRecordById.bind(null, onlineMeetingStore),
    saveStoreToDisk: saveStoreToDisk.bind(null, onlineMeetingStore),
    readStoreFromDisk: saveStoreToDisk.bind(null, onlineMeetingStore),
  };
};
