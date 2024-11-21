const baseContentScript = {
  matches: ['https://www.nnn.ed.nico/*'],
  all_frames: true,
  run_at: 'document_start',
} satisfies NonNullable<chrome.runtime.Manifest['content_scripts']>[number];

const manifest = {
  manifest_version: 3,
  name: 'ZEN Study +',
  version: '0.1.0',
  description: 'ZEN Studyに様々な機能を追加するChrome拡張機能',
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
  background: {
    service_worker: 'background/index.ts',
  },
} satisfies chrome.runtime.Manifest;

export default manifest;
