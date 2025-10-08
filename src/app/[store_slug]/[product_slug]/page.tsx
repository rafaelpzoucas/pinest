import { get } from "@vercel/edge-config";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { StoreEdgeConfig } from "@/features/store/initial-data/schemas";
import { readProductBySlug } from "@/features/store/products/read";
import { readStoreIdBySlug } from "@/features/store/store/read";
import { extractSubdomainOrDomain } from "@/lib/helpers";
import { formatSlug } from "@/utils/format-slug";
import { ChoicesSection } from "./choices";
import { ExtrasSection } from "./extras";
import { ProductImages } from "./images";
import { ProductInfo } from "./info";
import { ScrollToTop } from "./scroll-to-top";

// Componente de Loading para Suspense
function ProductLoading() {
  return (
    <div className="mt-[45vh] bg-background relative z-10 pb-24 animate-pulse">
      <div className="p-4">
        <div className="h-8 bg-muted rounded mb-4"></div>
        <div className="h-4 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
        <div className="h-12 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { store_slug: string; product_slug: string };
}): Promise<Metadata> {
  const sub =
    params.store_slug !== "undefined"
      ? params.store_slug
      : (extractSubdomainOrDomain() as string);

  const store = (await get(`store_${sub}`)) as StoreEdgeConfig;

  if (!store) {
    return { title: "Pinest" };
  }

  const formattedTitle = store?.name
    ?.toLowerCase()
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  return {
    title: `${formatSlug(params.product_slug)} | ${formattedTitle}`,
    description: store?.description,
    icons: { icon: store.logo_url },
    // Adicione Open Graph para melhor performance
    openGraph: {
      title: `${formatSlug(params.product_slug)} | ${formattedTitle}`,
      description: store?.description,
      images: store.logo_url ? [store.logo_url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { store_slug: string; product_slug: string };
}) {
  // Execute as consultas em paralelo para melhor performance
  const [storeData, productData] = await Promise.all([
    readStoreIdBySlug({ storeSlug: params.store_slug }),
    (async () => {
      const [store] = await readStoreIdBySlug({ storeSlug: params.store_slug });
      if (!store?.storeId) return [null];
      return readProductBySlug({
        productSlug: params.product_slug,
        storeId: store.storeId,
      });
    })(),
  ]);

  const product = productData[0]?.product;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-muted-foreground">
          Produto não encontrado
        </h1>
      </div>
    );
  }

  const productImages = product?.product_images || [];

  return (
    <div>
      {/* Imagens com prioridade LCP */}
      <ProductImages images={productImages} />

      <main className="mt-[45vh] bg-background relative z-10 pb-56">
        {/* Info do produto - crítico, sem Suspense */}
        <ProductInfo product={product} />

        {/* Extras - não crítico, pode usar Suspense */}
        <Suspense
          fallback={
            <div className="p-4">
              <div className="h-32 bg-muted rounded animate-pulse"></div>
            </div>
          }
        >
          {product.need_choices &&
            product?.product_choice_prices &&
            product?.product_choice_prices?.length > 0 && (
              <ChoicesSection
                choices={product.product_choice_prices}
                choiceLimit={product.choice_limit || 1}
              />
            )}
          <ExtrasSection
            storeId={storeData[0]?.storeId}
            productId={product.id}
          />
        </Suspense>
      </main>

      <ScrollToTop />
    </div>
  );
}

// Adicione ISR para páginas mais acessadas
export const revalidate = 3600; // 1 hora
