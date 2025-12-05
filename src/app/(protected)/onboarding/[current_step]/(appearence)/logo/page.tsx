import { readStore } from "@/app/(protected)/(app)/config/(options)/layout/actions";
import { AppearenceForm } from "@/app/(protected)/(app)/config/(options)/layout/appearence";
import { LogoAvatar } from "@/app/(protected)/(app)/config/(options)/layout/register/store/logo-avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AddLogo() {
  const [storeData] = await readStore();

  const store = storeData?.store;

  return (
    <div className="flex flex-col justify-center items-center gap-8 pb-16">
      <h1 className="text-3xl font-bold text-center">Adicione o seu logo</h1>

      <LogoAvatar store={store} />

      <AppearenceForm store={store} />

      <Link
        href="/onboarding/shipping/own"
        className={cn(buttonVariants(), "w-fit ml-auto")}
      >
        Próximo
      </Link>
    </div>
  );
}
