import { AdminHeader } from "@/app/admin-header";
import { readSocials } from "./actions";
import { SocialsForm } from "./form";

export default async function ProfileRegister() {
  const { socials, readSocialsError } = await readSocials();

  if (readSocialsError) {
    console.error(readSocialsError);
  }

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Redes sociais" withBackButton />

      <SocialsForm storeSocials={socials} />
    </section>
  );
}
