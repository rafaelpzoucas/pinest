import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ModaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !session?.user) {
    redirect("/sign-in");
  }

  const { data: master } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (master && master?.role !== "master") {
    return redirect("/sign-in");
  }
  return (
    <ThemeProvider
      storageKey="admin-theme"
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
