import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import logoDark from "../../../../../public/logo-dark.svg";
import { SignInWithGoogle } from "./google";

export default async function AdminSignIn({
  searchParams,
}: {
  searchParams: { message: string; error: string };
}) {
  const supabase = createClient();

  const { data: session, error } = await supabase.auth.getUser();

  if (!error || session?.user) {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user?.id)
      .single();

    if (!user) {
      return redirect("/onboarding/store/basic");
    }

    if (user && user?.role === "admin") redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center gap-6 p-8 h-screen">
      <Image src={logoDark} alt="pinest" width={175} />

      <SignInWithGoogle />

      {/* {searchParams.message && (
        <Card className={cn('flex flex-col gap-6 max-w-sm p-4')}>
          <p className="flex flex-row gap-2 text-lg">
            {searchParams.error ? <MailWarning /> : <CheckCircle />}

            {searchParams.error ? 'Erro ao autenticar' : 'Confira seu e-mail'}
          </p>
          <span className="text-sm text-muted-foreground">
            {searchParams.message}
          </span>

          {searchParams.error && (
            <Link href="/sign-in" className={buttonVariants()}>
              Tentar novamente
            </Link>
          )}
        </Card>
      )}

      {!searchParams.message && <SignInForm />} */}
    </main>
  );
}
