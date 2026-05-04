import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const media = defineCollection({
	loader: glob({ base: './src/content/media', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			type: z.enum(['movie', 'book', 'game']),
			status: z.enum(['completed', 'dropped']).default('completed'),
			date: z.coerce.date(), // date I finished it
			cover: image().optional(),
			tags: z.array(z.string()).optional(),
			author: z.string().optional(),    // book
			director: z.string().optional(),  // movie
			year: z.number().int().optional(), // movie/game release year
			platform: z.string().optional(),  // game
		}),
});

export const collections = { blog, media };
