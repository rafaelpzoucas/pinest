import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Lista de rotas críticas que precisam ficar "aquecidas"
  const routes = [
    "/orders",
    "/cash-register",
    "/catalog",
    "/promotions",
    "/config/account",
    "/config/layout",
    "/config/shipping",
    "/config/printing",
    "/config/integrations",
    "/reports",
    // adicione outras rotas críticas aqui
  ];

  try {
    // Faz as chamadas em paralelo para ser mais eficiente
    await Promise.allSettled(
      routes.map((route) =>
        fetch(`${baseUrl}${route}`, {
          method: "HEAD", // HEAD é mais leve que GET
        }),
      ),
    );

    return NextResponse.json({ ok: true, routes });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}
