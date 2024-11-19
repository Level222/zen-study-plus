import { defaultSyncOptions, HistoricalSyncOptions, migrateHistoricalSyncOptions } from '../utils/sync-options';

chrome.runtime.onInstalled.addListener(async () => {
  const unknownOptions = (await chrome.storage.sync.get('options')).options;

  try {
    const options = migrateHistoricalSyncOptions(
      HistoricalSyncOptions.parse(unknownOptions),
    );

    chrome.storage.sync.set({
      options,
    });
  } catch {
    chrome.storage.sync.set({
      options: defaultSyncOptions,
    });
  }
});
