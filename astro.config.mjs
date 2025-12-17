// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import react from '@astrojs/react';

export default defineConfig({
  site: "https://photos.ikuyo.dev",
  base: "/",
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [icon(), react()]
});