import * as z from 'zod';
import { SyncOptions } from './sync-options';

export const SyncStorage = z.object({
  options: SyncOptions,
  test: z.string(),
});

export type SyncStorage = z.infer<typeof SyncStorage>;

type GetSyncStorage
  = & (<T extends keyof SyncStorage>(keys: T | T[] | Pick<SyncStorage, T>) => Promise<Record<T, unknown>>)
    & ((keys?: null) => Promise<{ [K in keyof SyncStorage]?: unknown }>);

export const getSyncStorage: GetSyncStorage = <T extends keyof SyncStorage>(
  keys?: T | T[] | Pick<SyncStorage, T> | null,
) => (
  chrome.storage.sync.get<SyncStorage>(keys)
);

export const setSyncStorage = (items: Partial<SyncStorage>): Promise<void> => (
  chrome.storage.sync.set(items)
);
