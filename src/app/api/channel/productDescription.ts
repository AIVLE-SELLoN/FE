import { z } from 'zod';
import { api } from '../client';

const productDescriptionSchema = z.object({
  productGroupId: z.string(),
  channel: z.string(),
  description: z.string().nullable(),
});
export type ProductDescription = z.infer<typeof productDescriptionSchema>;

export async function getProductDescription(productGroupId: string, channel: string): Promise<ProductDescription> {
  const data = await api.get<unknown>('/channels/product-description', { params: { productGroupId, channel } });
  return productDescriptionSchema.parse(data);
}