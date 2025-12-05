import { AdminHeader } from "@/app/admin-header";
import { readAccountDataCached } from "./actions";
import { Address } from "./address";
import { Profile } from "./profile";
import { ManageSubscription } from "./subscription";

export default async function AccountPage() {
  const [account] = await readAccountDataCached();

  const user = account?.userData;
  const address = account?.storeAddress;
  const currentSubscription = account?.subscription;

  return (
    <main className="flex flex-col gap-4">
      <AdminHeader title="Minha conta" />

      <Profile user={user} />
      <Address address={address} />
      <ManageSubscription currentSubscription={currentSubscription} />
    </main>
  );
}
