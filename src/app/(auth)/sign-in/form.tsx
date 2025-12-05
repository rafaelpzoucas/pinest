import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export function SignInForm() {
  async function onSubmit(formData: FormData) {
    "use server";

    const supabase = createClient();

    const email = formData.get("email") as string;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/admin/auth/callback`,
      },
    });

    if (error) {
      return redirect(
        `/sign-in?error=true&message=Não foi possível efetuar o login, tente novamente em alguns instantes.`,
      );
    }

    return redirect(
      `/sign-in?message=Enviamos um e-mail para você. Clique no link para fazer o login.`,
    );
  }

  return (
    <form action={onSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" placeholder="Digite seu E-mail..." />
      </div>

      <Button type="submit" className="w-full max-w-md">
        Enviar super link
      </Button>
    </form>
  );
}
