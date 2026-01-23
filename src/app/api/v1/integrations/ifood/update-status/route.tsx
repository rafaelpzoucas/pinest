// app/api/v1/integrations/ifood/update-status/route.ts
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

const STATUS_ENDPOINT_MAP = {
  pending: "confirm",
  preparing: "startPreparation",
  readyToPickup: "readyToPickup",
  shipped: "dispatch",
  cancelled: "cancelled",
} as const;

type StatusKey = keyof typeof STATUS_ENDPOINT_MAP;

export async function POST(request: NextRequest) {
  const requestId = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  console.log(
    `[IFOOD-STATUS:${requestId}] ========== INÍCIO DA REQUISIÇÃO ==========`,
  );
  console.log(
    `[IFOOD-STATUS:${requestId}] Timestamp:`,
    new Date().toISOString(),
  );
  console.log(`[IFOOD-STATUS:${requestId}] Method:`, request.method);
  console.log(`[IFOOD-STATUS:${requestId}] URL:`, request.url);
  console.log(
    `[IFOOD-STATUS:${requestId}] Headers recebidos:`,
    sanitizeForLog(headersToObject(request.headers)),
  );

  try {
    const { orderId, newStatus, accessToken } = await request.json();
    console.log(`[IFOOD-STATUS:${requestId}] Body parseado:`, {
      orderId,
      newStatus,
      hasToken: !!accessToken,
    });

    if (!orderId) {
      console.error(`[IFOOD-STATUS:${requestId}] ❌ orderId não fornecido`);
      return NextResponse.json(
        { error: "orderId é obrigatório", requestId },
        { status: 400 },
      );
    }

    if (!newStatus) {
      console.error(`[IFOOD-STATUS:${requestId}] ❌ newStatus não fornecido`);
      return NextResponse.json(
        { error: "newStatus é obrigatório", requestId },
        { status: 400 },
      );
    }

    if (!accessToken) {
      console.error(`[IFOOD-STATUS:${requestId}] ❌ accessToken não fornecido`);
      return NextResponse.json(
        { error: "accessToken é obrigatório", requestId },
        { status: 400 },
      );
    }

    // Valida se o status é válido
    if (!(newStatus in STATUS_ENDPOINT_MAP)) {
      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ Status inválido:`,
        newStatus,
      );
      return NextResponse.json(
        {
          error: "Status inválido",
          validStatuses: Object.keys(STATUS_ENDPOINT_MAP),
          requestId,
        },
        { status: 400 },
      );
    }

    const api = process.env.IFOOD_API_BASE_URL;

    console.log(`[IFOOD-STATUS:${requestId}] Variáveis de ambiente:`, {
      api: api || "✗ Ausente",
    });

    if (!api) {
      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ IFOOD_API_BASE_URL não configurada`,
      );
      return NextResponse.json(
        { error: "Configuração da API do iFood ausente", requestId },
        { status: 500 },
      );
    }

    const statusEndpoint = STATUS_ENDPOINT_MAP[newStatus as StatusKey];
    const requestHeaders: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "PinestApp/1.0",
      Accept: "application/json",
    };

    const ifoodApiUrl = `${api}/order/v1.0/orders/${orderId}/${statusEndpoint}`;

    console.log(
      `[IFOOD-STATUS:${requestId}] ========== PREPARANDO CHAMADA PARA IFOOD ==========`,
    );
    console.log(`[IFOOD-STATUS:${requestId}] URL destino:`, ifoodApiUrl);
    console.log(`[IFOOD-STATUS:${requestId}] Method: POST`);
    console.log(
      `[IFOOD-STATUS:${requestId}] Headers enviados:`,
      sanitizeForLog(requestHeaders),
    );
    console.log(`[IFOOD-STATUS:${requestId}] Order ID:`, orderId);
    console.log(`[IFOOD-STATUS:${requestId}] Status Endpoint:`, statusEndpoint);
    console.log(`[IFOOD-STATUS:${requestId}] New Status:`, newStatus);

    const fetchStartTime = Date.now();
    console.log(`[IFOOD-STATUS:${requestId}] 🚀 Iniciando fetch para iFood...`);

    let response: Response;
    try {
      response = await fetch(ifoodApiUrl, {
        method: "POST",
        headers: requestHeaders,
        cache: "no-store",
      });
    } catch (fetchError) {
      const fetchDuration = Date.now() - fetchStartTime;
      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ Erro no fetch após ${fetchDuration}ms:`,
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
      `[IFOOD-STATUS:${requestId}] ✓ Fetch concluído em ${fetchDuration}ms`,
    );

    console.log(
      `[IFOOD-STATUS:${requestId}] ========== RESPOSTA DO IFOOD ==========`,
    );
    console.log(`[IFOOD-STATUS:${requestId}] Status:`, response.status);
    console.log(
      `[IFOOD-STATUS:${requestId}] Status Text:`,
      response.statusText,
    );
    console.log(
      `[IFOOD-STATUS:${requestId}] Headers recebidos:`,
      headersToObject(response.headers),
    );

    // Para atualização de status, um status 202 (Accepted) ou 204 (No Content) também é sucesso
    const isSuccess =
      response.ok || response.status === 202 || response.status === 204;

    if (!isSuccess) {
      const errorText = await response.text();

      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ Resposta de erro do iFood:`,
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
          `[IFOOD-STATUS:${requestId}] 🚫 BLOQUEIO CLOUDFLARE DETECTADO`,
        );
        console.error(
          `[IFOOD-STATUS:${requestId}] Cloudflare Ray ID:`,
          errorText.match(/Ray ID: <strong[^>]*>([^<]+)<\/strong>/)?.[1] ||
            "não encontrado",
        );
        console.error(
          `[IFOOD-STATUS:${requestId}] IP detectado pelo Cloudflare:`,
          errorText.match(/Your IP:[^<]*<span[^>]*>([^<]+)<\/span>/)?.[1] ||
            "não encontrado",
        );
      }

      return NextResponse.json(
        {
          error: "Erro ao atualizar status no iFood",
          details: errorText,
          status: response.status,
          requestId,
          debug: {
            isCloudflareBlock: errorText.includes("cloudflare"),
            responseHeaders: headersToObject(response.headers),
            fetchDuration: `${fetchDuration}ms`,
            endpoint: statusEndpoint,
          },
        },
        { status: response.status },
      );
    }

    // A resposta pode ser vazia (204 No Content)
    let responseData = null;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const responseText = await response.text();
      if (responseText) {
        console.log(
          `[IFOOD-STATUS:${requestId}] Response body length:`,
          responseText.length,
        );

        try {
          responseData = JSON.parse(responseText);
          console.log(
            `[IFOOD-STATUS:${requestId}] ✓ JSON parseado com sucesso`,
          );
        } catch (parseError) {
          console.warn(
            `[IFOOD-STATUS:${requestId}] ⚠️ Resposta não é JSON válido (provavelmente vazia)`,
          );
        }
      } else {
        console.log(
          `[IFOOD-STATUS:${requestId}] ✓ Resposta vazia (esperado para atualização de status)`,
        );
      }
    } else {
      console.log(`[IFOOD-STATUS:${requestId}] ✓ Resposta sem conteúdo JSON`);
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[IFOOD-STATUS:${requestId}] ========== ✅ SUCESSO ==========`);
    console.log(
      `[IFOOD-STATUS:${requestId}] Duração total: ${totalDuration}ms`,
    );
    console.log(
      `[IFOOD-STATUS:${requestId}] Status atualizado para: ${newStatus} (${statusEndpoint})`,
    );

    return NextResponse.json({
      success: true,
      orderId,
      newStatus,
      statusEndpoint,
      responseData,
      requestId,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              duration: `${totalDuration}ms`,
              fetchDuration: `${fetchDuration}ms`,
              httpStatus: response.status,
            }
          : undefined,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(
      `[IFOOD-STATUS:${requestId}] ========== ❌ ERRO FATAL ==========`,
    );
    console.error(
      `[IFOOD-STATUS:${requestId}] Duração até erro: ${totalDuration}ms`,
    );
    console.error(
      `[IFOOD-STATUS:${requestId}] Error type:`,
      error?.constructor?.name,
    );
    console.error(
      `[IFOOD-STATUS:${requestId}] Error message:`,
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      `[IFOOD-STATUS:${requestId}] Stack trace:`,
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
