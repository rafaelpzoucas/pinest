import { Categories } from "@/app/(protected)/(app)/catalog/categories";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Products } from "./product/products";

export default async function RegisterProducts({
  searchParams,
}: {
  searchParams: { tab: string };
}) {
  return (
    <div className="flex flex-col gap-4 p-4 lg:px-0">
      <Tabs
        defaultValue={searchParams.tab ?? "products"}
        className="bg-background p-4 rounded-lg"
      >
        <TabsList>
          <TabsTrigger value="products" asChild>
            <Link href="?tab=products">Produtos</Link>
          </TabsTrigger>
          <TabsTrigger value="categories" asChild>
            <Link href="?tab=categories">Categorias</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex flex-col gap-6">
            <Link
              href="register/product"
              className={cn(buttonVariants(), "max-w-sm")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar produto
            </Link>
            <section>
              <Products />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="categories">
          <div className="flex flex-col gap-6">
            <Link
              href="register/category"
              className={cn(buttonVariants(), "max-w-sm")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar categoria
            </Link>
            <section>
              <Categories />
            </section>
          </div>
        </TabsContent>
      </Tabs>

      <Link
        href="/onboarding/payments/stripe"
        className={cn(buttonVariants(), "ml-auto")}
      >
        Continuar para formas de pagamento
      </Link>
    </div>
  );
}
