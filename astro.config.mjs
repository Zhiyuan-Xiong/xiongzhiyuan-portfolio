import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://xiongzhiyuan-portfolio.pages.dev', output: 'static', trailingSlash: 'always', devToolbar: { enabled: false }, vite: { optimizeDeps: { noDiscovery: true, include: [] } } });
