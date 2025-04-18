import { defaultSyncOptions } from '../utils/default-options';
import { RuntimeMessage } from '../utils/runtime-messages';
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

chrome.runtime.onMessage.addListener((unknownMessage, sender) => {
  const message = RuntimeMessage.parse(unknownMessage);

  switch (message.type) {
    case 'SEND_BACK_KEYBOARD_SHORTCUTS': {
      const tabId = sender.tab?.id;

      if (tabId) {
        chrome.tabs.sendMessage<RuntimeMessage>(tabId, {
          type: 'KEYBOARD_SHORTCUTS',
          event: message.sendBackEvent,
        });
      }

      break;
    }
  }
});
