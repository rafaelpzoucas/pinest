import { IfoodOrder } from "@/models/ifood";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerAction } from "zsa";
import { webhookProcedure } from "./procedures";
import IfoodHandshakeDisputeSchema, { createIfoodOrderSchema } from "./schemas";
import { nofityStore } from "@/features/_global/orders/create";

// Helper para logs estruturados
const log = {
  info: (step: string, data?: any) => {
    console.log(
      `[IFOOD-INFO] ${step}`,
      data ? JSON.stringify(data, null, 2) : "",
    );
  },
  error: (step: string, error?: any) => {
    console.error(`[IFOOD-ERROR] ${step}`, error);
  },
  debug: (step: string, data?: any) => {
    console.log(`[IFOOD-DEBUG] ${step}`, data);
  },
};

export const readIntegration = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    log.info("readIntegration - Iniciando", { merchantId: input.merchantId });

    const { data: integration, error } = await supabase
      .from("ifood_integrations")
      .select("*")
      .eq("merchant_id", input.merchantId)
      .single();

    if (error) {
      log.error("readIntegration - Erro ao buscar integração", {
        error: error.message,
        code: error.code,
        merchantId: input.merchantId,
      });
      return null;
    }

    if (!integration) {
      log.error("readIntegration - Integração não encontrada", {
        merchantId: input.merchantId,
      });
      return null;
    }

    log.info("readIntegration - Integração encontrada", {
      storeId: integration.store_id,
      hasToken: !!integration.access_token,
      expiresAt: integration.expires_at,
    });

    return integration;
  });

export const readStore = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;
    const { merchantId } = input;

    log.info("readStore - Iniciando", { merchantId });

    const [integration, integrationError] = await readIntegration({
      merchantId,
    });

    if (integrationError) {
      log.error("readStore - Erro ao buscar integração", integrationError);
      return null;
    }

    if (!integration) {
      log.error("readStore - Integração não retornada");
      return null;
    }

    const { data: store, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", integration.store_id)
      .single();

    if (error) {
      log.error("readStore - Erro ao buscar loja", {
        error: error.message,
        storeId: integration.store_id,
      });
      return null;
    }

    if (!store) {
      log.error("readStore - Loja não encontrada", {
        storeId: integration.store_id,
      });
      return null;
    }

    log.info("readStore - Loja encontrada", {
      storeId: store.id,
      storeName: store.name,
    });

    return store;
  });

export const createOrder = webhookProcedure
  .createServerAction()
  .input(createIfoodOrderSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    log.info("createOrder - Iniciando", { orderId: input.id });

    const ifoodOrderData: IfoodOrder = input.ifood_order_data;

    const [store, storeError] = await readStore({
      merchantId: ifoodOrderData.merchant.id,
    });

    if (storeError) {
      log.error("createOrder - Erro ao buscar loja", storeError);
      return null;
    }

    if (!store) {
      log.error("createOrder - Loja não retornada");
      return null;
    }

    log.debug("createOrder - Preparando inserção", {
      storeId: store.id,
      orderId: input.id,
    });

    const { data: createdOrder, error: createdOrderError } = await supabase
      .from("orders")
      .insert({
        ...input,
        store_id: store.id,
        delivery_time: store.delivery_time,
      })
      .select();

    if (createdOrderError) {
      log.error("createOrder - Erro ao inserir pedido", {
        error: createdOrderError.message,
        code: createdOrderError.code,
        details: createdOrderError.details,
      });
      return null;
    }

    if (!createdOrder) {
      log.error("createOrder - Pedido não retornado após inserção");
      return null;
    }

    log.info("createOrder - Pedido criado com sucesso", {
      orderId: createdOrder[0]?.id,
    });

    try {
      await nofityStore({
        storeId: store?.id,
        title: "Novo pedido",
        icon: "/ifood-icon.png",
      });
      log.debug("createOrder - Notificação enviada");
    } catch (notifyError) {
      log.error("createOrder - Erro ao notificar loja", notifyError);
      // Não retorna erro pois o pedido já foi criado
    }

    return { createdOrder };
  });

export const refreshAccessToken = createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ input }) => {
    const { merchantId } = input;

    log.info("refreshAccessToken - Iniciando", { merchantId });

    try {
      // Chama a Route Handler interna que não passa pelo middleware
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/ifood/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        log.error("refreshAccessToken - Erro na Route Handler", errorData);
        return null;
      }

      const { accessToken } = await response.json();

      log.info("refreshAccessToken - Token renovado com sucesso");

      return accessToken;
    } catch (error) {
      log.error("refreshAccessToken - Erro ao chamar Route Handler", error);
      return null;
    }
  });

export const getAccessToken = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { merchantId } = input;
    const { supabase } = ctx;

    log.info("getAccessToken - Iniciando", { merchantId });

    const { data, error } = await supabase
      .from("ifood_integrations")
      .select("access_token, expires_at")
      .eq("merchant_id", merchantId)
      .single();

    if (error) {
      log.error("getAccessToken - Erro ao buscar token no banco", {
        error: error.message,
        code: error.code,
      });
      log.info("getAccessToken - Tentando gerar novo token");
      const [newToken, refreshError] = await refreshAccessToken({ merchantId });
      if (refreshError) {
        log.error("getAccessToken - Erro ao gerar novo token", refreshError);
        return null;
      }
      return newToken;
    }

    if (!data?.access_token) {
      log.info("getAccessToken - Token não encontrado, gerando novo", {
        merchantId,
      });
      const [newToken, refreshError] = await refreshAccessToken({ merchantId });
      if (refreshError) {
        log.error("getAccessToken - Erro ao gerar novo token", refreshError);
        return null;
      }
      return newToken;
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    log.debug("getAccessToken - Verificando expiração", {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isExpired: now >= expiresAt,
    });

    if (now >= expiresAt) {
      log.info("getAccessToken - Token expirado, renovando", { merchantId });
      const [newToken, refreshError] = await refreshAccessToken({ merchantId });
      if (refreshError) {
        log.error("getAccessToken - Erro ao renovar token", refreshError);
        return null;
      }
      log.info("getAccessToken - Token renovado com sucesso");
      return newToken;
    }

    log.info("getAccessToken - Token válido encontrado", { merchantId });
    return data.access_token;
  });

export const getIfoodOrderData = webhookProcedure
  .createServerAction()
  .input(
    z.object({
      merchantId: z.string(),
      orderId: z.string({ message: "orderId is required" }),
    }),
  )
  .handler(async ({ input }) => {
    const { orderId, merchantId } = input;
    const api = process.env.IFOOD_API_BASE_URL;

    log.info("getIfoodOrderData - Iniciando", { orderId, merchantId });

    if (!api) {
      log.error("getIfoodOrderData - IFOOD_API_BASE_URL não configurada");
      return null;
    }

    const [accessToken, tokenError] = await getAccessToken({ merchantId });

    if (tokenError) {
      log.error("getIfoodOrderData - Erro ao obter access token", tokenError);
      return null;
    }

    if (!accessToken) {
      log.error("getIfoodOrderData - Access token não retornado");
      return null;
    }

    log.debug("getIfoodOrderData - Token obtido, fazendo requisição", {
      url: `${api}/order/v1.0/orders/${orderId}`,
    });

    try {
      const response = await fetch(`${api}/order/v1.0/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      log.debug("getIfoodOrderData - Resposta recebida", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error("getIfoodOrderData - Erro na resposta da API", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        return null;
      }

      const data = await response.json();

      if (!data) {
        log.error("getIfoodOrderData - Pedido não encontrado na resposta");
        return null;
      }

      log.info("getIfoodOrderData - Dados do pedido obtidos", {
        orderId: data.id,
      });

      return data as IfoodOrder;
    } catch (fetchError) {
      log.error("getIfoodOrderData - Erro na requisição", {
        error: fetchError instanceof Error ? fetchError.message : fetchError,
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
      });
      return null;
    }
  });

export const handleOrderPlaced = webhookProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), merchantId: z.string() }))
  .handler(async ({ input }) => {
    const { orderId, merchantId } = input;

    log.info("handleOrderPlaced - Iniciando", { orderId, merchantId });

    const [orderData, orderError] = await getIfoodOrderData({
      orderId,
      merchantId,
    });

    if (orderError) {
      log.error(
        "handleOrderPlaced - Erro ao obter dados do pedido",
        orderError,
      );
      return NextResponse.json(
        {
          error: "Erro ao obter dados do pedido",
        },
        { status: 500 },
      );
    }

    if (!orderData) {
      log.error("handleOrderPlaced - Dados do pedido não retornados");
      return NextResponse.json(
        {
          error: "Dados do pedido não encontrados",
        },
        { status: 404 },
      );
    }

    const { id, createdAt, orderType, payments, total, delivery } = orderData;

    const newOrderValues = {
      id,
      created_at: createdAt,
      status: "accept",
      type: orderType,
      payment_type: payments?.methods?.[0]?.method ?? "unknown",
      is_paid: payments?.pending === 0,
      is_ifood: true,
      total: {
        shipping_price: total.deliveryFee,
        change_value: payments?.methods?.[0]?.cash?.changeFor ?? 0,
        discount: total.benefits,
        subtotal: total.subTotal,
        total_amount: total.orderAmount,
      },
      delivery:
        orderType === "DELIVERY"
          ? {
              time: delivery?.deliveryDateTime ?? undefined,
              address: delivery?.deliveryAddress?.formattedAddress ?? "",
            }
          : {
              time: undefined,
              address: "",
            },
      ifood_order_data: orderData,
    };

    log.debug("handleOrderPlaced - Validando dados do pedido");

    const validation = createIfoodOrderSchema.safeParse(newOrderValues);

    if (!validation.success) {
      log.error("handleOrderPlaced - Erro de validação", {
        errors: validation.error.errors,
      });
      return NextResponse.json(
        {
          error: "Erro de validação",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    log.debug("handleOrderPlaced - Criando pedido");

    const [response, createError] = await createOrder(newOrderValues);

    if (createError) {
      log.error("handleOrderPlaced - Erro ao criar pedido", createError);
      return NextResponse.json(
        {
          error: "Erro ao criar pedido",
        },
        { status: 500 },
      );
    }

    if (!response) {
      log.error("handleOrderPlaced - Pedido não retornado após criação");
      return NextResponse.json(
        {
          error: "Pedido não criado",
        },
        { status: 500 },
      );
    }

    log.info("handleOrderPlaced - Pedido criado com sucesso", { orderId });

    return NextResponse.json({ message: "Pedido criado com sucesso." });
  });

export const handleOrderNewStatus = webhookProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), newStatus: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { orderId, newStatus } = input;
    const { supabase } = ctx;

    log.info("handleOrderNewStatus - Iniciando", { orderId, newStatus });

    const { data, error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select();

    if (error) {
      log.error("handleOrderNewStatus - Erro ao atualizar status", {
        error: error.message,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: "Erro ao atualizar status",
        },
        { status: 500 },
      );
    }

    if (!data) {
      log.error("handleOrderNewStatus - Pedido não retornado após atualização");
      return NextResponse.json(
        {
          error: "Pedido não encontrado",
        },
        { status: 404 },
      );
    }

    log.info("handleOrderNewStatus - Status atualizado com sucesso", {
      orderId,
    });

    return NextResponse.json({ message: "Pedido confirmado com sucesso." });
  });

export const handleCancelOrder = webhookProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { orderId } = input;
    const { supabase } = ctx;

    log.info("handleCancelOrder - Iniciando", { orderId });

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .select();

    if (error) {
      log.error("handleCancelOrder - Erro ao cancelar pedido", {
        error: error.message,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: "Erro ao cancelar pedido",
        },
        { status: 500 },
      );
    }

    if (!data) {
      log.error("handleCancelOrder - Pedido não retornado após cancelamento");
      return NextResponse.json(
        {
          error: "Pedido não encontrado",
        },
        { status: 404 },
      );
    }

    log.info("handleCancelOrder - Pedido cancelado com sucesso", { orderId });

    return NextResponse.json({ message: "Pedido cancelado com sucesso." });
  });

export const keepAlive = createServerAction().handler(async () => {
  log.debug("keepAlive - Evento recebido");
  return NextResponse.json({
    message: "Evento KEEPALIVE recebido.",
  });
});

export const createHandshakeEvent = webhookProcedure
  .createServerAction()
  .input(IfoodHandshakeDisputeSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    log.info("createHandshakeEvent - Iniciando", {
      merchantId: input.merchantId,
      orderId: input.orderId,
    });

    const [store, storeError] = await readStore({
      merchantId: input.merchantId,
    });

    if (storeError) {
      log.error("createHandshakeEvent - Erro ao buscar loja", storeError);
    }

    const { error } = await supabase
      .from("ifood_events")
      .upsert(input)
      .select();

    if (error) {
      log.error("createHandshakeEvent - Erro ao salvar evento", {
        error: error.message,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: "Erro ao salvar evento",
        },
        { status: 500 },
      );
    }

    log.info("createHandshakeEvent - Evento salvo com sucesso");

    revalidatePath("/");

    try {
      await nofityStore({
        storeId: store?.id,
        title: "Novo pedido",
        icon: "/ifood-icon.png",
      });
      log.debug("createHandshakeEvent - Notificação enviada");
    } catch (notifyError) {
      log.error("createHandshakeEvent - Erro ao notificar loja", notifyError);
    }

    return NextResponse.json({
      message: "Evento de handshake tratado com sucesso!",
    });
  });

export const deleteHandshakeEvent = webhookProcedure
  .createServerAction()
  .input(z.object({ order_id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    log.info("deleteHandshakeEvent - Iniciando", { orderId: input.order_id });

    const { error } = await supabase
      .from("ifood_events")
      .delete()
      .eq("orderId", input.order_id);

    if (error) {
      log.error("deleteHandshakeEvent - Erro ao deletar evento", {
        error: error.message,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: "Erro ao deletar evento",
        },
        { status: 500 },
      );
    }

    log.info("deleteHandshakeEvent - Evento deletado com sucesso");

    revalidatePath("/");

    return NextResponse.json({
      message: "Evento de handshake tratado com sucesso!",
    });
  });
