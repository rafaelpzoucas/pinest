import { ShippingConfigType } from "@/models/shipping";

export async function readAdminShipping(storeId: string) {
  const res = await fetch(`/api/v1/admin/shipping?storeId=${storeId}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados de entrega: ${res.status}`);
  }

  const { shipping } = await res.json();

  return shipping as ShippingConfigType;
}
