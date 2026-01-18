import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper para sanitizar dados sensíveis nos logs
function sanitizeForLog(obj: Record<string, any>) {
  const sanitized = { ...obj };
  const sensitiveKeys = [
    "clientSecret",
    "accessToken",
    "access_token",
    "authorization",
  ];

  for (const key of Object.keys(sanitized)) {
    if (
      sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))
    ) {
      sanitized[key] = "***REDACTED***";
    }
  }

  return sanitized;
}

// Helper para converter Headers em objeto
function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Log da requisição recebida
  console.log(
    `[IFOOD:${requestId}] ========== INÍCIO DA REQUISIÇÃO ==========`,
  );
  console.log(`[IFOOD:${requestId}] Timestamp:`, new Date().toISOString());
  console.log(`[IFOOD:${requestId}] Method:`, request.method);
  console.log(`[IFOOD:${requestId}] URL:`, request.url);
  console.log(
    `[IFOOD:${requestId}] Headers recebidos:`,
    sanitizeForLog(headersToObject(request.headers)),
  );

  try {
    const { merchantId } = await request.json();
    console.log(`[IFOOD:${requestId}] Body parseado:`, { merchantId });

    if (!merchantId) {
      console.error(`[IFOOD:${requestId}] ❌ merchantId não fornecido`);
      return NextResponse.json(
        { error: "merchantId é obrigatório", requestId },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const clientId = process.env.IFOOD_CLIENT_ID;
    const clientSecret = process.env.IFOOD_CLIENT_SECRET;
    const api = process.env.IFOOD_API_BASE_URL;

    console.log(`[IFOOD:${requestId}] Variáveis de ambiente:`, {
      clientId: clientId ? "✓ Presente" : "✗ Ausente",
      clientSecret: clientSecret ? "✓ Presente" : "✗ Ausente",
      api: api || "✗ Ausente",
    });

    if (!clientId || !clientSecret || !api) {
      console.error(`[IFOOD:${requestId}] ❌ Variáveis de ambiente faltando`);
      return NextResponse.json(
        { error: "Variáveis de ambiente faltando", requestId },
        { status: 500 },
      );
    }

    const body = new URLSearchParams();
    body.append("grantType", "client_credentials");
    body.append("clientId", clientId);
    body.append("clientSecret", clientSecret);

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "PinestApp/1.0",
      Accept: "application/json",
    };

    const ifoodApiUrl = `${api}/authentication/v1.0/oauth/token`;

    console.log(
      `[IFOOD:${requestId}] ========== PREPARANDO CHAMADA PARA IFOOD ==========`,
    );
    console.log(`[IFOOD:${requestId}] URL destino:`, ifoodApiUrl);
    console.log(`[IFOOD:${requestId}] Method: POST`);
    console.log(`[IFOOD:${requestId}] Headers enviados:`, requestHeaders);
    console.log(`[IFOOD:${requestId}] Body params:`, {
      grantType: "client_credentials",
      clientId: clientId.substring(0, 8) + "...",
      clientSecret: "***",
    });

    const fetchStartTime = Date.now();
    console.log(`[IFOOD:${requestId}] 🚀 Iniciando fetch para iFood...`);

    let response: Response;
    try {
      response = await fetch(ifoodApiUrl, {
        method: "POST",
        headers: requestHeaders,
        body: body.toString(),
        cache: "no-store",
      });
    } catch (fetchError) {
      const fetchDuration = Date.now() - fetchStartTime;
      console.error(
        `[IFOOD:${requestId}] ❌ Erro no fetch após ${fetchDuration}ms:`,
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
        },
      );
      throw fetchError;
    }

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`[IFOOD:${requestId}] ✓ Fetch concluído em ${fetchDuration}ms`);

    console.log(`[IFOOD:${requestId}] ========== RESPOSTA DO IFOOD ==========`);
    console.log(`[IFOOD:${requestId}] Status:`, response.status);
    console.log(`[IFOOD:${requestId}] Status Text:`, response.statusText);
    console.log(
      `[IFOOD:${requestId}] Headers recebidos:`,
      headersToObject(response.headers),
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(`[IFOOD:${requestId}] ❌ Resposta de erro do iFood:`, {
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers),
        bodyPreview: errorText.substring(0, 500),
        bodyLength: errorText.length,
        isCloudflareBlock:
          errorText.includes("cloudflare") || errorText.includes("Cloudflare"),
        hasHtmlResponse:
          errorText.trim().startsWith("<!DOCTYPE") ||
          errorText.trim().startsWith("<html"),
      });

      // Detecta se é bloqueio do Cloudflare
      if (
        errorText.includes("Cloudflare") ||
        errorText.includes("cloudflare")
      ) {
        console.error(`[IFOOD:${requestId}] 🚫 BLOQUEIO CLOUDFLARE DETECTADO`);
        console.error(
          `[IFOOD:${requestId}] Cloudflare Ray ID:`,
          errorText.match(/Ray ID: <strong[^>]*>([^<]+)<\/strong>/)?.[1] ||
            "não encontrado",
        );
        console.error(
          `[IFOOD:${requestId}] IP detectado pelo Cloudflare:`,
          errorText.match(/Your IP:[^<]*<span[^>]*>([^<]+)<\/span>/)?.[1] ||
            "não encontrado",
        );
      }

      return NextResponse.json(
        {
          error: "Erro na API do iFood",
          details: errorText,
          status: response.status,
          requestId,
          debug: {
            isCloudflareBlock: errorText.includes("cloudflare"),
            responseHeaders: headersToObject(response.headers),
            fetchDuration: `${fetchDuration}ms`,
          },
        },
        { status: response.status },
      );
    }

    const responseText = await response.text();
    console.log(
      `[IFOOD:${requestId}] Response body length:`,
      responseText.length,
    );

    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[IFOOD:${requestId}] ✓ JSON parseado com sucesso`);
      console.log(`[IFOOD:${requestId}] Response structure:`, {
        hasAccessToken: !!data.accessToken,
        hasExpiresIn: !!data.expiresIn,
        expiresIn: data.expiresIn,
        tokenPreview: data.accessToken
          ? `${data.accessToken.substring(0, 20)}...`
          : "N/A",
      });
    } catch (parseError) {
      console.error(`[IFOOD:${requestId}] ❌ Erro ao parsear JSON:`, {
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
        responsePreview: responseText.substring(0, 200),
      });
      throw parseError;
    }

    if (!data.accessToken) {
      console.error(
        `[IFOOD:${requestId}] ❌ AccessToken não presente na resposta`,
      );
      console.error(
        `[IFOOD:${requestId}] Response data:`,
        sanitizeForLog(data),
      );
      return NextResponse.json(
        { error: "AccessToken não retornado", requestId },
        { status: 500 },
      );
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expiresIn);

    console.log(
      `[IFOOD:${requestId}] ========== SALVANDO NO SUPABASE ==========`,
    );
    console.log(`[IFOOD:${requestId}] Merchant ID:`, merchantId);
    console.log(`[IFOOD:${requestId}] Expires at:`, expiresAt.toISOString());

    const dbStartTime = Date.now();
    const { error } = await supabase
      .from("ifood_integrations")
      .update({
        access_token: data.accessToken,
        expires_at: expiresAt.toISOString(),
      })
      .eq("merchant_id", merchantId);

    const dbDuration = Date.now() - dbStartTime;
    console.log(
      `[IFOOD:${requestId}] Database operation concluída em ${dbDuration}ms`,
    );

    if (error) {
      console.error(`[IFOOD:${requestId}] ❌ Erro ao salvar no banco:`, {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: "Erro ao salvar token no banco", requestId },
        { status: 500 },
      );
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[IFOOD:${requestId}] ========== ✅ SUCESSO ==========`);
    console.log(`[IFOOD:${requestId}] Duração total: ${totalDuration}ms`);
    console.log(`[IFOOD:${requestId}] Breakdown:`, {
      fetch: `${fetchDuration}ms`,
      database: `${dbDuration}ms`,
      other: `${totalDuration - fetchDuration - dbDuration}ms`,
    });

    return NextResponse.json({
      accessToken: data.accessToken,
      expiresAt: expiresAt.toISOString(),
      requestId,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              duration: `${totalDuration}ms`,
              fetchDuration: `${fetchDuration}ms`,
              dbDuration: `${dbDuration}ms`,
            }
          : undefined,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[IFOOD:${requestId}] ========== ❌ ERRO FATAL ==========`);
    console.error(`[IFOOD:${requestId}] Duração até erro: ${totalDuration}ms`);
    console.error(`[IFOOD:${requestId}] Error type:`, error?.constructor?.name);
    console.error(
      `[IFOOD:${requestId}] Error message:`,
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      `[IFOOD:${requestId}] Stack trace:`,
      error instanceof Error ? error.stack : "N/A",
    );

    return NextResponse.json(
      {
        error: "Erro interno ao processar requisição",
        message: error instanceof Error ? error.message : String(error),
        requestId,
      },
      { status: 500 },
    );
  }
}
