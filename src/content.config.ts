import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const dateSchema = z.preprocess((arg) => {
  if (arg instanceof Date) return arg;
  if (typeof arg === 'string' || typeof arg === 'number') {
    const d = new Date(arg);
    if (!isNaN(d.getTime())) return d;
  }
  return arg;
}, z.date());

const stringOrArray = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim());
  }
  return [];
}, z.array(z.string()).default([]));

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string().optional().default(''),
      date: dateSchema,
      layout: z.string().optional(),
      'header-img': z.string().optional(),
      headerImg: z.string().optional(),
      catalog: z.boolean().optional().default(false),
      categories: stringOrArray,
      tags: stringOrArray,
      published: z.boolean().optional().default(true),
      draft: z.boolean().optional().default(false),
    })
    .transform((data) => ({
      ...data,
      headerImg: data.headerImg || data['header-img'],
      draft: data.draft || data.published === false,
    })),
});

const projects = defineCollection({
  loader: file('src/content/projects/projects.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().default(''),
    since: z.union([z.string(), z.number()]).optional(),
    github: z.string().optional(),
    readme: z.string().optional(),
    web: z.string().optional(),
    npm: z.string().optional(),
    stacks: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };

