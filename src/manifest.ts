const baseContentScript = {
  matches: ['https://www.nnn.ed.nico/*'],
  all_frames: true,
  run_at: 'document_start',
} satisfies NonNullable<chrome.runtime.Manifest['content_scripts']>[number];

const manifest = {
  manifest_version: 3,
  name: 'ZEN Study +',
  version: '1.0.1',
  description: 'ZEN Studyに様々な機能を追加するChrome拡張機能',
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  permissions: [
    'storage',
  ],
  content_scripts: [
    {
      ...baseContentScript,
      js: ['content-main/index.ts'],
      world: 'MAIN',
    },
    {
      ...baseContentScript,
      js: ['content-isolated/index.ts'],
    },
  ],
  options_ui: {
    page: 'options-ui/index.html',
    open_in_tab: true,
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: {
      16: 'icons/icon-16.png',
      24: 'icons/icon-24.png',
      32: 'icons/icon-32.png',
    },
  },
  background: {
    service_worker: 'background/index.ts',
  },
} satisfies chrome.runtime.Manifest;

export default manifest;
