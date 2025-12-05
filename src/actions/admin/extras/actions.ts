import { ExtraType } from "@/models/extras";

export async function readAdminExtras(storeId: string) {
  const res = await fetch(`/api/v1/admin/extras?storeId=${storeId}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar extras: ${res.status}`);
  }

  const { extras } = await res.json();

  return extras as ExtraType[];
}
