"use client";

import { Box } from "lucide-react";
import { useParams } from "next/navigation";
import type { Category } from "@/features/store/initial-data/schemas";
import { LazyCategorySection } from "./lazy-categories";

export function ProductsList({ categories }: { categories: Category[] }) {
  const params = useParams();

  const subdomain = params.store_slug as string;

  if (!categories) {
    return <p>Carregando...</p>;
  }

  if (!categories || categories.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
          mx-auto"
      >
        <Box className="w-20 h-20" />
        <p className="text-muted-foreground">
          Não encontramos nenhuma categoria
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8 p-4 pb-36">
      {categories.map((category) => (
        <LazyCategorySection
          key={category.id}
          category={category}
          storeSubdomain={subdomain}
        />
      ))}
    </section>
  );
}
