"use client";

import {
  useIntersectionObserver,
  useLazyCategories,
} from "@/features/store/initial-data/hooks";
import type { Category } from "@/features/store/initial-data/schemas";
import { ProductCard } from "./product-card";

interface LazyCategorySectionProps {
  category: Category;
  storeSubdomain: string;
}

export function LazyCategorySection({
  category,
  storeSubdomain,
}: LazyCategorySectionProps) {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "200px",
  });

  const { data, isLoading, error } = useLazyCategories(
    category.id,
    hasIntersected,
  );

  const categoryWithProducts = data?.category;

  return (
    <div ref={ref} id={category.name.toLowerCase()} className="flex flex-col">
      <div className="py-4 bg-background border-b">
        <h1 className="text-xl uppercase font-bold">{category.name}</h1>
      </div>

      <div className="min-h-[200px]">
        {!hasIntersected ? (
          // Placeholder - categoria ainda não foi "vista"
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
              <ProductCard key={i} variant={"default"} storeSubdomain="" />
            ))}
          </div>
        ) : isLoading ? (
          // Loading - fazendo a query com join
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
              <ProductCard key={i} variant={"default"} storeSubdomain="" />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p>Erro ao carregar produtos desta categoria</p>
          </div>
        ) : categoryWithProducts?.products &&
          categoryWithProducts.products.length > 0 ? (
          // Products carregados via join
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 pt-4">
            {categoryWithProducts.products.map((product) => (
              <ProductCard
                key={product.id}
                variant="default"
                data={product}
                storeSubdomain={storeSubdomain}
              />
            ))}
          </div>
        ) : (
          // Categoria sem produtos
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p>Nenhum produto nesta categoria</p>
          </div>
        )}
      </div>
    </div>
  );
}
