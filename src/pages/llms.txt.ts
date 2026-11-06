import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const projects = await getCollection('projects');
  const featuredProjects = projects.filter((p) => p.data.featured);

  let content = `# Jirawat Boonkumnerd (ntsd.dev)

> Software engineer blog focusing on distributed systems, performance optimization, Go, WebRTC, database indexing, and static web architectures.

## Canonical Endpoints
- [Home](https://ntsd.dev/)
- [About](https://ntsd.dev/about/)
- [Blog Index](https://ntsd.dev/blog/)
- [Projects](https://ntsd.dev/projects/)
- [Tags](https://ntsd.dev/tags/)
- [Categories](https://ntsd.dev/categories/)
- [RSS Feed](https://ntsd.dev/feed.xml)

## Articles
`;

  for (const post of posts) {
    const slug = post.id.replace(/^\d{4}-\d{1,2}-\d{1,2}-/, '');
    const desc = post.data.description ? `: ${post.data.description}` : '';
    content += `- [${post.data.title}](https://ntsd.dev/${slug}/)${desc}\n`;
  }

  content += `\n## Featured Projects\n`;
  for (const project of featuredProjects) {
    content += `- [${project.data.name}](https://ntsd.dev/projects/${project.data.id}/): ${project.data.description}\n`;
  }

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
