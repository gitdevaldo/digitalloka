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
        selected_stock_id: z.coerce.number().int().positive().optional(),
        selected_region: z.string().optional(),
        selected_image: z.string().optional(),
        vps_config: z.object({
          provider: z.string(),
          region: z.string(),
          regionName: z.string(),
          sizeSlug: z.string(),
          stockId: z.number(),
          vcpus: z.number(),
          memory: z.number(),
          disk: z.number(),
          transfer: z.number(),
          priceMonthly: z.number(),
          os: z.string().optional(),
          osName: z.string().optional(),
        }).optional(),
      }),
    )
    .min(1, 'Cart must contain at least one item'),
  customer_name: z.string().min(1, 'Name is required').max(255),
  customer_email: z.string().email('Must be a valid email'),
  customer_mobile: z.string().min(1, 'Phone number is required').max(30),
});

const productBaseFields = {
  name: z.string().min(1, 'name is required').max(255),
  slug: z.string().min(1, 'slug is required').max(255),
  product_type: z.enum(['digital', 'physical', 'subscription', 'service', 'vps_droplet', 'template', 'course', 'ebook', 'plugin', 'ui_kit']).optional().default('digital'),
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
  product_type: z.enum(['digital', 'physical', 'subscription', 'service', 'vps_droplet', 'template', 'course', 'ebook', 'plugin', 'ui_kit']).optional(),
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

export const productStockCreateSchema = z.object({
  product_id: z.coerce.number().int().positive('product_id must be a positive integer'),
  credential_data: z.record(z.unknown()).refine(val => Object.keys(val).length > 0, 'credential_data must be a non-empty object'),
});

export const productStockBulkSchema = z.object({
  headers: z.array(z.string().min(1)).min(1, 'headers must contain at least one entry'),
  rows: z.string().min(1, 'rows is required'),
});

export const productTypeCreateSchema = z.object({
  type: z.string().min(1, 'type is required').max(100),
  label: z.string().min(1, 'label is required').max(255),
  description: z.string().max(1000).optional().default(''),
  is_active: z.boolean().optional().default(true),
  fields: z.array(z.unknown()).optional().default([]),
});

export const syncSizesUpdateSchema = z.object({
  stock_item_id: z.coerce.number().int().positive('stock_item_id is required'),
  status: z.enum(['enabled', 'disabled']).optional(),
  selling_price: z.coerce.number().min(0).optional(),
});

export const cartItemSchema = z.object({
  productId: z.coerce.number().int().positive('productId must be a positive integer'),
  quantity: z.coerce.number().int().min(1).max(50),
  configId: z.string().optional(),
  selectedStockId: z.coerce.number().int().positive().optional(),
  selectedRegion: z.string().optional(),
  selectedImage: z.string().optional(),
  vpsConfig: z.record(z.unknown()).optional(),
});

export const cartUpdateSchema = z.object({
  items: z.array(cartItemSchema),
});

export const sessionSetSchema = z.object({
  access_token: z.string().min(1, 'access_token is required'),
  refresh_token: z.string().optional().default(''),
});

export const productActionSchema = z.object({
  action: z.enum(['view_details', 'download_assets', 'renew', 'revoke'], {
    errorMap: () => ({ message: 'Invalid action' }),
  }),
});

export const wishlistToggleSchema = z.object({
  product_id: z.coerce.number().int().positive('product_id must be a positive integer'),
});

export const cartProductIdsSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, 'ids must contain at least one item'),
});

export const settingsUpdateSchema = z.object({
  group: z.string().min(1, 'group is required'),
  values: z.record(z.unknown()).refine(val => typeof val === 'object', 'values must be an object'),
});

export const userAccessUpdateSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  is_active: z.boolean().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.string().min(1, 'status is required'),
});

export const entitlementStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'active', 'expired', 'revoked'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
  reason: z.string().optional(),
});

export const entitlementExtendSchema = z.object({
  days: z.coerce.number().int().positive().optional().default(30),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
});

export const testEmailSchema = z.object({
  to: z.string().email('Valid email address required'),
});

export const productStockUpdateSchema = z.object({
  credential_data: z.record(z.unknown()).optional(),
  status: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  is_unlimited: z.boolean().optional(),
});

export const productTypeUpdateSchema = z.object({
  label: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
  fields: z.array(z.unknown()).optional(),
});

export const providerDataCreateSchema = z.object({
  provider: z.string().min(1, 'provider is required'),
  resource_type: z.enum(['region', 'image'], {
    errorMap: () => ({ message: 'resource_type must be "region" or "image"' }),
  }),
  slug: z.string().min(1, 'slug is required'),
  name: z.string().min(1, 'name is required'),
  available: z.boolean().optional().default(true),
  data: z.record(z.unknown()).optional().default({}),
});

export const providerDataUpdateSchema = z.object({
  id: z.coerce.number().int().positive('id is required'),
  name: z.string().optional(),
  slug: z.string().optional(),
  available: z.boolean().optional(),
});

export const manualSizeCreateSchema = z.object({
  provider: z.string().min(1, 'provider is required'),
  slug: z.string().min(1, 'slug is required'),
  vcpus: z.coerce.number().int().positive('vcpus is required'),
  memory: z.coerce.number().int().positive('memory is required'),
  disk: z.coerce.number().int().positive('disk is required'),
  transfer: z.coerce.number().min(0).optional().default(0),
  price_monthly: z.coerce.number().min(0).optional().default(0),
  selling_price: z.coerce.number().min(0).optional(),
  regions: z.array(z.string()).optional().default([]),
});
