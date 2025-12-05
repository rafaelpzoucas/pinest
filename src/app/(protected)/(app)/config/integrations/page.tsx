import { AdminHeader } from "@/app/admin-header";
import { SubscriptionPlans } from "@/components/subscription-plans";

import { isPermissionGranted } from "../../actions";
import { Ifood } from "./ifood";

export default async function IntegrationsPage() {
  const [permission] = await isPermissionGranted({
    feature: "integration_ifood",
  });

  if (!permission?.granted) {
    return <SubscriptionPlans />;
  }

  return (
    <div className="p-4 lg:px-0 space-y-6">
      <AdminHeader title="Integrações" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Ifood />
      </div>
    </div>
  );
}
