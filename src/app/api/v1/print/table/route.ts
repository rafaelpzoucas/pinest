// app/api/v1/print/table/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildReceiptTableESCPOS } from "@/lib/receipts";

const inputSchema = z.object({
  tableId: z.string(),
  reprint: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // Parse e valida o body
    const body = await req.json();
    const validated = inputSchema.parse(body);

    // Cria cliente Supabase (servidor)
    const supabase = createClient();

    // Busca os dados da mesa
    const { data: table, error: tableError } = await supabase
      .from("tables")
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        )
      `,
      )
      .eq("id", validated.tableId)
      .single();

    if (tableError || !table) {
      return NextResponse.json(
        {
          success: false,
          message: "Mesa não encontrada",
          error: tableError?.message,
        },
        { status: 404 },
      );
    }

    // Busca configurações de impressão
    const { data: printSettings, error: settingsError } = await supabase
      .from("printer_settings")
      .select("*")
      .eq("store_id", table.store_id)
      .single();

    if (settingsError) {
      console.error("Erro ao buscar configurações:", settingsError);
    }

    // Verifica se impressão automática está habilitada
    if (!printSettings?.auto_print) {
      return NextResponse.json({
        success: false,
        message: "Impressão automática desabilitada",
        kitchenPrinted: false,
        errors: [],
      });
    }

    // Busca impressoras configuradas
    const { data: printers, error: printersError } = await supabase
      .from("printers")
      .select(
        `
        *,
        profile:printer_profiles (*)
      `,
      )
      .eq("store_id", table.store_id);

    if (printersError || !printers || printers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Nenhuma impressora encontrada",
          kitchenPrinted: false,
          errors: [],
        },
        { status: 404 },
      );
    }

    const result = {
      kitchenPrinted: false,
      errors: [] as string[],
    };

    // Processa cada impressora
    for (const printer of printers) {
      try {
        // Verifica se a impressora deve imprimir pedidos de cozinha
        if (
          printer.sectors.length === 0 ||
          printer.sectors.includes("kitchen")
        ) {
          // Gera o texto da impressão
          const textKitchen = buildReceiptTableESCPOS(
            table,
            validated.reprint,
            printer.profile,
          );

          // Verifica duplicação na fila
          const { data: existingInQueue } = await supabase
            .from("print_queue")
            .select("id")
            .eq("store_id", table.store_id)
            .eq("printed", false)
            .eq("raw", textKitchen)
            .eq("printer_name", printer.name)
            .maybeSingle();

          // Se já existe na fila, pula
          if (existingInQueue) {
            console.log(
              `Item já existe na fila para impressora ${printer.name}`,
            );
            continue;
          }

          // Adiciona à fila de impressão
          const { error: queueError } = await supabase
            .from("print_queue")
            .insert({
              store_id: table.store_id,
              raw: textKitchen,
              printer_name: printer.name,
            });

          if (queueError) {
            throw new Error(`Erro ao adicionar à fila: ${queueError.message}`);
          }

          result.kitchenPrinted = true;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Erro na impressora "${printer.name}": ${errorMsg}`);
        console.error(`Erro na impressora ${printer.name}:`, err);
      }
    }

    return NextResponse.json({
      success: result.kitchenPrinted,
      ...result,
    });
  } catch (error) {
    console.error("Erro ao processar impressão:", error);

    // Se for erro de validação do Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    // Erro genérico
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar impressão",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
