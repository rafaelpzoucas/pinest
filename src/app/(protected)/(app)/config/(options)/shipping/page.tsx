import { AdminHeader } from "@/app/admin-header";

import { readOwnShipping } from "./actions";
import { OwnShippingForm } from "./own-shipping/form";

export default async function ShippingPage() {
  const { shipping } = await readOwnShipping();
  // const { carriers } = await selectCarriers()

  return (
    <div className="space-y-6">
      <AdminHeader title="Entrega" />

      {/* <CarrierShippingForm shipping={shipping} carriers={carriers} /> */}

      <OwnShippingForm shipping={shipping} />
    </div>
  );
}
