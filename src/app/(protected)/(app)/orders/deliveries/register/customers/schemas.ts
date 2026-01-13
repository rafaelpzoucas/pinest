import { addressSchema } from "@/features/admin/address/schemas";
import { z } from "zod";

export const createCustomerFormSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  address: addressSchema,
});
