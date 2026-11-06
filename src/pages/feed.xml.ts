import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Jirawat Boonkumnerd',
    description: 'A software engineer who loves coding.',
    site: context.site ? context.site.toString() : 'https://ntsd.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',
      link: `/${post.id.replace(/^\d{4}-\d{1,2}-\d{1,2}-/, '')}/`,
      categories: post.data.categories || [],
    })),
    customData: `<language>en-us</language>`,
  });
};
