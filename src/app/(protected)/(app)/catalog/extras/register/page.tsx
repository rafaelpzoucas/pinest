import { AdminHeader } from "@/app/admin-header";
import { readExtraById } from "./actions";
import { ExtraForm } from "./form/form";

export default async function NewExtra({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const { extra, extraError } = await readExtraById(searchParams.id);

  const displayId = extra?.id.substring(0, 4);

  if (extraError) {
    console.error(extraError);
  }

  return (
    <div className="space-y-4 p-4 lg:px-0">
      <AdminHeader
        title={`${searchParams.id ? `Editando adicional #${displayId}` : "Novo adicional"}`}
        withBackButton
      />

      <ExtraForm extra={extra} />
    </div>
  );
}
