// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import remarkWikiLink from 'remark-wiki-link';

const slugify = (t) =>
  t.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');

// https://astro.build/config
export default defineConfig({
  site: 'https://www.xiashj.com',
  integrations: [mdx(), sitemap(), svelte()],

  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        pageResolver: (name) => [slugify(name)],
        hrefTemplate: (permalink) => `/media/${permalink}`,
        wikiLinkClassName: 'wiki-link',
        newClassName: 'wiki-link-new',
      }],
    ],
  },

  fonts: [
      {
          provider: fontProviders.local(),
          name: 'Atkinson',
          cssVariable: '--font-atkinson',
          fallbacks: ['sans-serif'],
          options: {
              variants: [
                  {
                      src: ['./src/assets/fonts/atkinson-regular.woff'],
                      weight: 400,
                      style: 'normal',
                      display: 'swap',
                  },
                  {
                      src: ['./src/assets/fonts/atkinson-bold.woff'],
                      weight: 700,
                      style: 'normal',
                      display: 'swap',
                  },
              ],
          },
      },
      {
          provider: fontProviders.google(),
          name: 'M PLUS Rounded 1c',
          cssVariable: '--font-mplus',
          fallbacks: ['sans-serif'],
          weights: [400, 700],
      },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});