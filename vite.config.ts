import type { UserConfig } from 'vite';
import path from 'node:path';
import webExtension from 'vite-plugin-web-extension';
import zipPack from 'vite-plugin-zip-pack';
import { CLASS_NAME_PREFIX } from './src/constants';
import manifest from './src/manifest';

const RELEASE_NAME = 'zen-study-plus';

export default {
  root: 'src',
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
          warn(warning);
        }
      },
    },
  },
  css: {
    modules: {
      generateScopedName: `${CLASS_NAME_PREFIX}_[local]_[hash:base64:5]`,
    },
  },
  plugins: [
    webExtension({
      manifest: () => manifest,
      disableAutoLaunch: true,
    }),
    zipPack({
      outDir: 'releases',
      outFileName: `${RELEASE_NAME}-v${manifest.version}.zip`,
      filter: (fileName) => fileName !== '.vite',
    }),
  ],
} satisfies UserConfig;
