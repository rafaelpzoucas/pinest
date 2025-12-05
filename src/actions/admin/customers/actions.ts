import { AdminCustomerType } from "@/models/store-customer";
import { CreateAdminCustomerType } from "./schemas";

export async function readAdminCustomers(storeId: string) {
  const res = await fetch(`/api/v1/admin/customers?storeId=${storeId}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar clientes: ${res.status}`);
  }

  const { customers } = await res.json();

  return customers as AdminCustomerType[];
}

export async function createAdminCustomer(values: CreateAdminCustomerType) {
  const body = JSON.stringify(values);

  const res = await fetch("/api/v1/admin/customers/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Erro ao criar novo cliente: ${res.status}`);
  }

  const data = await res.json();

  return {
    createdStoreCustomer: data.createdStoreCustomer as AdminCustomerType,
  };
}
