// app/api/v1/integrations/ifood/order/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeForLog(obj: Record<string, any>) {
  const sanitized = { ...obj };
  const sensitiveKeys = ["authorization", "accessToken", "access_token"];

  for (const key of Object.keys(sanitized)) {
    if (
      sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))
    ) {
      sanitized[key] = "***REDACTED***";
    }
  }

  return sanitized;
}

function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export async function POST(request: NextRequest) {
  const requestId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  console.log(
    `[IFOOD-ORDER:${requestId}] ========== INÍCIO DA REQUISIÇÃO ==========`,
  );
  console.log(
    `[IFOOD-ORDER:${requestId}] Timestamp:`,
    new Date().toISOString(),
  );
  console.log(`[IFOOD-ORDER:${requestId}] Method:`, request.method);
  console.log(`[IFOOD-ORDER:${requestId}] URL:`, request.url);
  console.log(
    `[IFOOD-ORDER:${requestId}] Headers recebidos:`,
    sanitizeForLog(headersToObject(request.headers)),
  );

  try {
    const { orderId, accessToken } = await request.json();
    console.log(`[IFOOD-ORDER:${requestId}] Body parseado:`, {
      orderId,
      hasToken: !!accessToken,
    });

    if (!orderId) {
      console.error(`[IFOOD-ORDER:${requestId}] ❌ orderId não fornecido`);
      return NextResponse.json(
        { error: "orderId é obrigatório", requestId },
        { status: 400 },
      );
    }

    if (!accessToken) {
      console.error(`[IFOOD-ORDER:${requestId}] ❌ accessToken não fornecido`);
      return NextResponse.json(
        { error: "accessToken é obrigatório", requestId },
        { status: 400 },
      );
    }

    const api = process.env.IFOOD_API_BASE_URL;

    console.log(`[IFOOD-ORDER:${requestId}] Variáveis de ambiente:`, {
      api: api || "✗ Ausente",
    });

    if (!api) {
      console.error(
        `[IFOOD-ORDER:${requestId}] ❌ IFOOD_API_BASE_URL não configurada`,
      );
      return NextResponse.json(
        { error: "Configuração da API do iFood ausente", requestId },
        { status: 500 },
      );
    }

    const requestHeaders: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "PinestApp/1.0",
      Accept: "application/json",
    };

    const ifoodApiUrl = `${api}/order/v1.0/orders/${orderId}`;

    console.log(
      `[IFOOD-ORDER:${requestId}] ========== PREPARANDO CHAMADA PARA IFOOD ==========`,
    );
    console.log(`[IFOOD-ORDER:${requestId}] URL destino:`, ifoodApiUrl);
    console.log(`[IFOOD-ORDER:${requestId}] Method: GET`);
    console.log(
      `[IFOOD-ORDER:${requestId}] Headers enviados:`,
      sanitizeForLog(requestHeaders),
    );
    console.log(`[IFOOD-ORDER:${requestId}] Order ID:`, orderId);

    const fetchStartTime = Date.now();
    console.log(`[IFOOD-ORDER:${requestId}] 🚀 Iniciando fetch para iFood...`);

    let response: Response;
    try {
      response = await fetch(ifoodApiUrl, {
        method: "GET",
        headers: requestHeaders,
        cache: "no-store",
      });
    } catch (fetchError) {
      const fetchDuration = Date.now() - fetchStartTime;
      console.error(
        `[IFOOD-ORDER:${requestId}] ❌ Erro no fetch após ${fetchDuration}ms:`,
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
    console.log(
      `[IFOOD-ORDER:${requestId}] ✓ Fetch concluído em ${fetchDuration}ms`,
    );

    console.log(
      `[IFOOD-ORDER:${requestId}] ========== RESPOSTA DO IFOOD ==========`,
    );
    console.log(`[IFOOD-ORDER:${requestId}] Status:`, response.status);
    console.log(`[IFOOD-ORDER:${requestId}] Status Text:`, response.statusText);
    console.log(
      `[IFOOD-ORDER:${requestId}] Headers recebidos:`,
      headersToObject(response.headers),
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `[IFOOD-ORDER:${requestId}] ❌ Resposta de erro do iFood:`,
        {
          status: response.status,
          statusText: response.statusText,
          headers: headersToObject(response.headers),
          bodyPreview: errorText.substring(0, 500),
          bodyLength: errorText.length,
          isCloudflareBlock:
            errorText.includes("cloudflare") ||
            errorText.includes("Cloudflare"),
          hasHtmlResponse:
            errorText.trim().startsWith("<!DOCTYPE") ||
            errorText.trim().startsWith("<html"),
        },
      );

      if (
        errorText.includes("Cloudflare") ||
        errorText.includes("cloudflare")
      ) {
        console.error(
          `[IFOOD-ORDER:${requestId}] 🚫 BLOQUEIO CLOUDFLARE DETECTADO`,
        );
        console.error(
          `[IFOOD-ORDER:${requestId}] Cloudflare Ray ID:`,
          errorText.match(/Ray ID: <strong[^>]*>([^<]+)<\/strong>/)?.[1] ||
            "não encontrado",
        );
        console.error(
          `[IFOOD-ORDER:${requestId}] IP detectado pelo Cloudflare:`,
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
      `[IFOOD-ORDER:${requestId}] Response body length:`,
      responseText.length,
    );

    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[IFOOD-ORDER:${requestId}] ✓ JSON parseado com sucesso`);
      console.log(`[IFOOD-ORDER:${requestId}] Response structure:`, {
        hasId: !!data.id,
        hasOrderType: !!data.orderType,
        hasTotal: !!data.total,
        hasPayments: !!data.payments,
      });
    } catch (parseError) {
      console.error(`[IFOOD-ORDER:${requestId}] ❌ Erro ao parsear JSON:`, {
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
        responsePreview: responseText.substring(0, 200),
      });
      throw parseError;
    }

    if (!data || !data.id) {
      console.error(`[IFOOD-ORDER:${requestId}] ❌ Dados do pedido inválidos`);
      console.error(`[IFOOD-ORDER:${requestId}] Response data:`, data);
      return NextResponse.json(
        { error: "Dados do pedido não encontrados", requestId },
        { status: 404 },
      );
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[IFOOD-ORDER:${requestId}] ========== ✅ SUCESSO ==========`);
    console.log(`[IFOOD-ORDER:${requestId}] Duração total: ${totalDuration}ms`);
    console.log(`[IFOOD-ORDER:${requestId}] Order ID:`, data.id);

    return NextResponse.json({
      orderData: data,
      requestId,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              duration: `${totalDuration}ms`,
              fetchDuration: `${fetchDuration}ms`,
            }
          : undefined,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(
      `[IFOOD-ORDER:${requestId}] ========== ❌ ERRO FATAL ==========`,
    );
    console.error(
      `[IFOOD-ORDER:${requestId}] Duração até erro: ${totalDuration}ms`,
    );
    console.error(
      `[IFOOD-ORDER:${requestId}] Error type:`,
      error?.constructor?.name,
    );
    console.error(
      `[IFOOD-ORDER:${requestId}] Error message:`,
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      `[IFOOD-ORDER:${requestId}] Stack trace:`,
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
