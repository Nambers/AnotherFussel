// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import react from '@astrojs/react';

export default defineConfig({
  integrations: [icon(), react()]
});