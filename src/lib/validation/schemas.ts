import { z } from 'zod';

export const checkoutSchema = z.object({
  product_id: z.coerce.number().int().positive('product_id must be a positive integer'),
  quantity: z.coerce.number().int().positive().max(50, 'quantity must be at most 50').optional(),
  affiliate_code: z.string().optional(),
});

export const cartCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.coerce.number().int().positive('product_id must be a positive integer'),
        quantity: z.coerce.number().int().positive().max(50, 'quantity must be at most 50').default(1),
      }),
    )
    .min(1, 'Cart must contain at least one item'),
});

const productBaseFields = {
  name: z.string().min(1, 'name is required').max(255),
  slug: z.string().min(1, 'slug is required').max(255),
  product_type: z.enum(['digital', 'physical', 'subscription', 'service']).optional().default('digital'),
  status: z.enum(['available', 'unavailable', 'draft', 'archived']).optional().default('available'),
  short_description: z.string().max(1000).optional(),
  description: z.string().optional(),
  price_amount: z.coerce.number().min(0, 'price_amount must be non-negative').optional().default(0),
  price_currency: z.string().length(3).optional().default('USD'),
  price_billing_period: z.enum(['one-time', 'monthly', 'yearly']).optional().default('one-time'),
  catalog_visibility: z.enum(['visible', 'hidden']).optional(),
  featured: z.array(z.unknown()).optional().default([]),
  faq_items: z.array(z.unknown()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  badges: z.array(z.string()).optional().default([]),
  meta: z.record(z.unknown()).optional().default({}),
  category_id: z.coerce.number().int().positive().optional(),
  category_ids: z.array(z.coerce.number().int().positive()).optional(),
  category_name: z.string().optional(),
  category_names: z.array(z.string()).optional(),
};

export const productCreateSchema = z.object({
  ...productBaseFields,
  name: productBaseFields.name,
  slug: productBaseFields.slug,
});

export const productUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  product_type: z.enum(['digital', 'physical', 'subscription', 'service']).optional(),
  status: z.enum(['available', 'unavailable', 'draft', 'archived']).optional(),
  short_description: z.string().max(1000).optional(),
  description: z.string().optional(),
  price_amount: z.coerce.number().min(0, 'price_amount must be non-negative').optional(),
  price_currency: z.string().length(3).optional(),
  price_billing_period: z.enum(['one-time', 'monthly', 'yearly']).optional(),
  catalog_visibility: z.enum(['visible', 'hidden']).optional(),
  featured: z.array(z.unknown()).optional(),
  faq_items: z.array(z.unknown()).optional(),
  meta: z.record(z.unknown()).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  category_ids: z.array(z.coerce.number().int().positive()).optional(),
  category_name: z.string().optional(),
  category_names: z.array(z.string()).optional(),
});

export const stockImportSchema = z.object({
  product_id: z.coerce.number().int().positive('product_id must be a positive integer'),
  headers: z.array(z.string().min(1)).min(1, 'headers must contain at least one entry'),
  rows: z.string().min(1, 'rows is required'),
  set_as_default_headers: z.boolean().optional(),
});

export const dropletActionSchema = z.object({
  type: z.enum(['power_on', 'power_off', 'shutdown', 'reboot', 'power_cycle'], {
    errorMap: () => ({ message: 'Invalid action. Allowed: power_on, power_off, shutdown, reboot, power_cycle' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  next: z.string().optional(),
  mode: z.enum(['user', 'admin']).optional().default('user'),
});
