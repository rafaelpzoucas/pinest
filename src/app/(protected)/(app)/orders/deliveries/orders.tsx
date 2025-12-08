"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCashRegister } from "@/stores/cashRegisterStore";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useServerAction } from "zsa-react";
import { readCashSession } from "../../cash-register/actions";
import { columns } from "./data-table/columns";
import { DataTable } from "./data-table/table";
import { OrderCard } from "./order-card";
import { useOrders } from "@/features/admin/orders/hooks";

type OrderStatus =
  | "accept"
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "readyToPickup";

export function Deliveries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("in_progress");

  // Hook com realtime integrado
  const { data: orders, isLoading } = useOrders();

  const normalizeString = (str: string | undefined) => str?.toLowerCase() || "";
  const searchStr = normalizeString(search);

  function getStatusLengths(statuses: OrderStatus[]) {
    return (
      orders?.filter((order) => {
        const isDelivered = statuses.includes("delivered");
        const isInProgress =
          statuses.includes("accept") ||
          statuses.includes("pending") ||
          statuses.includes("preparing") ||
          statuses.includes("shipped") ||
          statuses.includes("readyToPickup");

        if (isDelivered && !isInProgress) {
          return order.status === "delivered" && order.is_paid === true;
        }

        if (isInProgress) {
          return (
            statuses.includes(order.status as OrderStatus) ||
            (order.status === "delivered" && order.is_paid === false)
          );
        }

        return statuses.includes(order.status as OrderStatus);
      }).length || 0
    );
  }

  const statusFilters = [
    {
      status: "in_progress",
      title: "andamento",
      status_length: getStatusLengths([
        "accept",
        "pending",
        "preparing",
        "shipped",
        "readyToPickup",
      ]),
    },
    {
      status: "delivered",
      title: "finalizada(s)",
      status_length: getStatusLengths(["delivered"]),
    },
    {
      status: "cancelled",
      title: "cancelada(s)",
      status_length: getStatusLengths(["cancelled"]),
    },
  ];

  const filteredOrders = orders?.filter((order) => {
    const { store_customers: storeCustomers, status, id } = order;

    const matchesSearch =
      normalizeString(storeCustomers?.customers?.name).includes(searchStr) ||
      id.includes(searchStr);

    const matchesStatus =
      statusFilter === "in_progress"
        ? [
            "accept",
            "pending",
            "preparing",
            "shipped",
            "readyToPickup",
          ].includes(status) ||
          (status === "delivered" && order.is_paid === false)
        : statusFilter === "delivered"
          ? status === "delivered" && order.is_paid === true
          : statusFilter
            ? status === statusFilter
            : true;

    return matchesSearch && matchesStatus;
  });

  function handleStatusClick(status: string) {
    setStatusFilter((prevStatus) => (prevStatus === status ? "" : status));
  }

  const { setIsCashOpen } = useCashRegister();

  const { execute, data } = useServerAction(readCashSession, {
    onSuccess: () => {
      const isOpen = !!data?.cashSession;
      setIsCashOpen(isOpen);
    },
  });

  // Carregar cash session
  useEffect(() => {
    execute();
  }, [execute]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-4 text-sm pb-16">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-md mb-4" />
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-md" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 text-sm pb-16">
      <header className="flex flex-col lg:flex-row gap-4">
        <Link
          href="orders/orders/register"
          className={cn(buttonVariants(), "w-full max-w-sm")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar pedido
        </Link>

        <div className="relative w-full">
          <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Buscar pedido..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {statusFilters.map((filter) => (
          <Card
            key={filter.status}
            className={`p-2 px-4 flex flex-col text-xl select-none cursor-pointer transition-colors
            ${statusFilter === filter.status ? "border-primary" : ""}`}
            onClick={() => handleStatusClick(filter.status)}
          >
            <strong>{filter.status_length}</strong>
            <span className="text-xs text-muted-foreground">
              {filter.title}
            </span>
          </Card>
        ))}
      </section>

      <span className="text-xs text-muted-foreground">
        Exibindo {filteredOrders?.length || 0} pedido(s)
      </span>

      <div className="lg:hidden flex flex-col gap-2">
        {filteredOrders && filteredOrders.length > 0
          ? filteredOrders?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          : search !== "" && (
              <div>
                Não encontramos nenhum resultado para &apos;{search}&apos;
              </div>
            )}
      </div>

      <div className="hidden lg:flex w-full">
        {filteredOrders && (
          <DataTable columns={columns} data={filteredOrders} />
        )}
      </div>
    </section>
  );
}
