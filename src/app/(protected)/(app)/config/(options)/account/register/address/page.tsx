import { AdminHeader } from "@/app/admin-header";
import { readAddress } from "./actions";
import { AddressForm } from "./form";

export default async function AddressRegister({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const { address, readAddressError } = await readAddress();

  if (readAddressError) {
    console.error(readAddressError);
  }

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Editar endereço" withBackButton />

      <AddressForm address={address} />
    </section>
  );
}
