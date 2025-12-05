import { AdminHeader } from "@/app/admin-header";
import { readBenefitById } from "./actions";
import { BenefitForm } from "./form";

export default async function BenefitsRegister({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const { benefit, readBenefitError } = await readBenefitById(searchParams.id);

  if (readBenefitError) {
    console.error(readBenefitError);
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`${benefit ? "Editar " : "Novo "} benefício`}
        withBackButton
      />

      <BenefitForm benefit={benefit} />
    </div>
  );
}
