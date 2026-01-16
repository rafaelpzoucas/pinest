import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { merchantId } = await request.json();

    if (!merchantId) {
      return NextResponse.json(
        { error: "merchantId é obrigatório" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const clientId = process.env.IFOOD_CLIENT_ID;
    const clientSecret = process.env.IFOOD_CLIENT_SECRET;
    const api = process.env.IFOOD_API_BASE_URL;

    if (!clientId || !clientSecret || !api) {
      return NextResponse.json(
        { error: "Variáveis de ambiente faltando" },
        { status: 500 },
      );
    }

    const body = new URLSearchParams();
    body.append("grantType", "client_credentials");
    body.append("clientId", clientId);
    body.append("clientSecret", clientSecret);

    const response = await fetch(`${api}/authentication/v1.0/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Erro na API do iFood", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (!data.accessToken) {
      return NextResponse.json(
        { error: "AccessToken não retornado" },
        { status: 500 },
      );
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expiresIn);

    const { error } = await supabase
      .from("ifood_integrations")
      .update({
        access_token: data.accessToken,
        expires_at: expiresAt.toISOString(),
      })
      .eq("merchant_id", merchantId);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao salvar token no banco" },
        { status: 500 },
      );
    }

    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("[IFOOD] Erro ao renovar token:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
      { status: 500 },
    );
  }
}
