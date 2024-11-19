declare namespace chrome.storage {
  type SyncStorage = import('./utils/storage').SyncStorage;

  // The next line prevents things without the export keyword from being automatically exported (like SyncStorage)
  export {};

  export interface StorageArea {
    get:
    & (<T extends keyof SyncStorage>(
      keys: T | T[] | Pick<SyncStorage, T>,
    ) => Promise<Record<T, unknown>>)
    & (
      (keys?: null) => Promise<{ [K in keyof SyncStorage]?: unknown }>
    );

    set: (items: Partial<SyncStorage>) => Promise<void>;
  }
}
