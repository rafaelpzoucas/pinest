"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Choice } from "@/features/store/choices/schemas";
import { formatCurrencyBRL } from "@/lib/utils";
import { ChoiceOptions } from "../options";

export const columns: ColumnDef<Choice>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => {
      const price =
        row.original?.prices[0] && row.original?.prices.length > 0
          ? row.original.prices[0].price
          : 0;

      return formatCurrencyBRL(price);
    },
  },
  {
    accessorKey: "id",
    header: "Ações",
    cell: ({ row }) => <ChoiceOptions choiceId={row.getValue("id")} />,
  },
];
