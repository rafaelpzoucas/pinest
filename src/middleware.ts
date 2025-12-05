// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // cria o client no edge com manipulação de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.delete({
            name,
            ...options,
          });
        },
      },
    },
  );

  // apenas força o Supabase a reidratar/atualizar cookies
  await supabase.auth.getSession();

  return res;
}

// middleware roda em *todas* as rotas, exceto assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
