import { readAdminCategoriesServer } from "@/actions/admin/categories";
import { AdminHeader } from "@/app/admin-header";
import { readStore } from "../../../dashboard/actions";
import { readProductsByStore } from "../../products/actions";
import { readChoiceById } from "./actions";
import { ChoiceForm } from "./form/form";

export default async function NewChoice({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const { store, storeError } = await readStore();

  if (storeError) {
    console.error("Erro ao buscar loja em NewChoice: ", storeError);
  }

  const [[categoriesData], { data: products }, { choice, choiceError }] =
    await Promise.all([
      readAdminCategoriesServer({ storeId: store?.id as string }),
      readProductsByStore(store?.id),
      readChoiceById(searchParams.id),
    ]);

  const displayId = choice?.id.substring(0, 4);

  if (choiceError) {
    console.error(choiceError);
  }

  return (
    <div className="space-y-4 p-4 lg:px-0">
      <AdminHeader
        title={`${searchParams.id ? `Editando escolha #${displayId}` : "Nova escolha"}`}
        withBackButton
      />

      <ChoiceForm
        choice={choice}
        categories={categoriesData?.categories}
        products={products}
      />
    </div>
  );
}
