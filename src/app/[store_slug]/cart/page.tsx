import { get } from "@vercel/edge-config";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { StoreEdgeConfig } from "@/features/store/initial-data/schemas";
import { extractSubdomainOrDomain } from "@/lib/helpers";
import { cn } from "@/utils/cn";
import { createPath } from "@/utils/createPath";
import { CouponField } from "../checkout/(summary)/coupon-field";
import { CartProducts } from "./cart-products";

export async function generateMetadata({
  params,
}: {
  params: { store_slug: string };
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
    title: `Carrinho | ${formattedTitle}`,
    description: store?.description,
    icons: { icon: store.logo_url },
  };
}

export default async function CartPage({
  params,
}: {
  params: { store_slug: string };
}) {
  return (
    <main className="mt-[68px] p-4 flex flex-col pb-56">
      <CouponField />

      <Link
        href={createPath("/", params.store_slug)}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "w-full uppercase",
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar mais itens
      </Link>

      <CartProducts storeSlug={params.store_slug} />
    </main>
  );
}
