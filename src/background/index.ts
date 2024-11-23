import { defaultSyncOptions } from '../utils/default-options';
import { getSyncStorage, setSyncStorage } from '../utils/storage';
import { HistoricalSyncOptions, migrateHistoricalSyncOptions } from '../utils/sync-options';

chrome.runtime.onInstalled.addListener(async () => {
  const unknownOptions = (await getSyncStorage('options')).options;

  try {
    const options = migrateHistoricalSyncOptions(
      HistoricalSyncOptions.parse(unknownOptions),
    );

    setSyncStorage({ options });
  } catch {
    setSyncStorage({ options: defaultSyncOptions });
  }
});
