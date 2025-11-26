import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string(),
  title: z.string().min(1, "Title is required.").max(120),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Item = z.infer<typeof ItemSchema>;
