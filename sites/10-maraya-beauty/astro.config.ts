import { defineConfig } from 'astro/config';
import { awSite } from '@aw/astro';
import site from './site.config.ts';
import tokens from './brand/tokens.ts';
import studio from '../../studio.config.ts';

export default defineConfig(awSite({ site, tokens, studio, root: import.meta.url }));
