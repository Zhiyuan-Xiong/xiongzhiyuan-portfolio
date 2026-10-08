import type { APIRoute } from 'astro';
import { published } from '../data/projects';
import { categories } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  const routes = ['zh', 'en'].flatMap(lang => [
    `/${lang}/`, `/${lang}/explore/`, `/${lang}/works/`, `/${lang}/about/`,
    ...categories.map(category => `/${lang}/sections/${category.id}/`),
    ...published.map(project => `/${lang}/work/${project.slug}/`),
  ]);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    routes.map(route => `<url><loc>${new URL(route, site).href}</loc></url>`).join('') + '</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
