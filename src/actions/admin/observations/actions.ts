import { ObservationType } from "@/models/observation";
import { CreateAdminObservationType } from "./schemas";

export async function createAdminObservation(
  values: CreateAdminObservationType,
) {
  const body = JSON.stringify(values);

  const res = await fetch("/api/v1/admin/observations/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Erro ao criar nova observação: ${res.status}`);
  }

  const data = await res.json();

  return {
    createdObservation: data.createdObservation as ObservationType,
  };
}

export async function readAdminObservations(storeId: string) {
  const res = await fetch(`/api/v1/admin/observations?storeId=${storeId}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar observations: ${res.status}`);
  }

  const { observations } = await res.json();

  return observations as ObservationType[];
}
