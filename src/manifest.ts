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
      matches: [
        'https://www.nnn.ed.nico/*',
      ],
      js: [
        'content-main/index.ts',
      ],
      run_at: 'document_start',
      world: 'MAIN',
    },
    {
      matches: [
        'https://www.nnn.ed.nico/*',
      ],
      js: [
        'content-isolated/index.ts',
      ],
      run_at: 'document_start',
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
