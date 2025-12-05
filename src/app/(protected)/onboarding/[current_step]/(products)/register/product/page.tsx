import { readCategoriesByStore } from "@/app/(protected)/(app)/catalog/categories/actions";
import { ProductForm } from "@/app/(protected)/(app)/catalog/products/register/form/form";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function RegisterProduct() {
  const { data: categories } = await readCategoriesByStore();

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Novo produto</h1>

      {!categories || categories.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-xl font-bold">
            Você ainda não tem categorias cadastradas
          </h1>
          <p className="text-sm text-muted-foreground">
            Para adicionar produtos, primeiro crie uma categoria.
          </p>
          <Link
            href={`/onboarding/products/register/category`}
            className={buttonVariants()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar categoria
          </Link>
        </div>
      ) : (
        <ProductForm categories={categories} product={null} />
      )}
    </div>
  );
}
