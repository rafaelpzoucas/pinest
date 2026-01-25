// app/api/v1/integrations/ifood/update-status/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_ENDPOINT_MAP = {
  accept: "confirm",
  readyToPickup: "readyToPickup",
  shipped: "dispatch",
  cancelled: "cancelled",
} as const;

type StatusKey = keyof typeof STATUS_ENDPOINT_MAP;

function createRequestId() {
  return `status_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function errorResponse(
  status: number,
  requestId: string,
  payload: Record<string, unknown>,
) {
  return NextResponse.json({ requestId, ...payload }, { status });
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { orderId, newStatus, accessToken } = body ?? {};

    if (!orderId) {
      console.error(`[IFOOD-STATUS:${requestId}] ❌ orderId não fornecido`);
      return errorResponse(400, requestId, {
        error: "orderId é obrigatório",
      });
    }

    if (!newStatus) {
      console.error(`[IFOOD-STATUS:${requestId}] ❌ newStatus não fornecido`);
      return errorResponse(400, requestId, {
        error: "newStatus é obrigatório",
      });
    }

    if (!accessToken) {
      console.error(`[IFOOD-STATUS:${requestId}] ❌ accessToken não fornecido`);
      return errorResponse(400, requestId, {
        error: "accessToken é obrigatório",
      });
    }

    if (!(newStatus in STATUS_ENDPOINT_MAP)) {
      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ Status inválido:`,
        newStatus,
      );

      return errorResponse(400, requestId, {
        error: `Status inválido: ${newStatus}`,
        validStatuses: Object.keys(STATUS_ENDPOINT_MAP),
      });
    }

    const api = process.env.IFOOD_API_BASE_URL;

    if (!api) {
      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ IFOOD_API_BASE_URL não configurada`,
      );

      return errorResponse(500, requestId, {
        error: "Configuração da API do iFood ausente",
      });
    }

    const statusEndpoint = STATUS_ENDPOINT_MAP[newStatus as StatusKey];

    const ifoodApiUrl = `${api}/order/v1.0/orders/${orderId}/${statusEndpoint}`;

    let response: Response;
    const fetchStart = Date.now();

    try {
      response = await fetch(ifoodApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "PinestApp/1.0",
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch (err) {
      const duration = Date.now() - fetchStart;

      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ Erro no fetch após ${duration}ms`,
        err,
      );

      throw err;
    }

    const isSuccess =
      response.ok || response.status === 202 || response.status === 204;

    if (!isSuccess) {
      const errorText = await response.text();
      const isCloudflare =
        errorText.includes("cloudflare") || errorText.includes("Cloudflare");

      console.error(
        `[IFOOD-STATUS:${requestId}] ❌ Erro retornado pelo iFood`,
        {
          status: response.status,
          statusText: response.statusText,
          isCloudflare,
          bodyPreview: errorText.slice(0, 500),
        },
      );

      return errorResponse(response.status, requestId, {
        error: "Erro ao atualizar status no iFood",
        status: response.status,
        details: errorText,
        isCloudflare,
      });
    }

    // Parse somente se realmente existir JSON
    let responseData: unknown = null;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const text = await response.text();
      if (text) {
        try {
          responseData = JSON.parse(text);
        } catch {
          // Ignora parse inválido silenciosamente
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      newStatus,
      statusEndpoint,
      responseData,
      requestId,
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    console.error(
      `[IFOOD-STATUS:${requestId}] ❌ ERRO FATAL após ${totalDuration}ms`,
      error,
    );

    return errorResponse(500, requestId, {
      error: "Erro interno ao processar requisição",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
