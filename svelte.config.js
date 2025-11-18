import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  preprocess: [
    vitePreprocess(),
    /** @type {import('svelte/compiler').PreprocessorGroup} */(mdsvex({
      rehypePlugins: [
        rehypeSlug,
      ],
    })),
  ],
  extensions: ['.svelte', '.svx'],
};
