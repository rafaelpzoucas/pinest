'use server'

import {
  buildReceiptDeliveryText,
  buildReceiptKitchenText,
  buildReceiptTableText,
} from '@/lib/receipts'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { readPurchaseById } from '../../purchases/deliveries/[id]/actions'
import { readTableById } from '../../purchases/tables/[id]/actions'
import { purchaseTest } from './purchase-test'
import {
  printerSchema,
  PrinterType,
  printingSettingsSchema,
  PrintingSettingsType,
  printQueueSchema,
  PrintQueueType,
} from './schemas'

export const addToPrintQueue = adminProcedure
  .createServerAction()
  .input(z.array(printQueueSchema))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const { error } = await supabase.from('print_queue').insert(
      input.map((item) => ({
        store_id: store.id,
        text: item.text,
        font_size: item.font_size,
        printer_name: item.printer_name,
      })),
    )

    if (error) {
      throw new Error('Erro ao adicionar itens à fila de impressão: ', error)
    }

    return { success: true }
  })

export const updatePrintQueueItem = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('print_queue')
      .update({ printed: true, printed_at: new Date().toISOString() })
      .eq('id', input.id)

    if (error) {
      throw new Error('Erro ao atualizar item da fila de impressão', error)
    }
  })

export const readPrintPendingItems = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('print_queue')
      .select('*')
      .eq('printed', false)
      .eq('store_id', store.id)

    if (error) throw new Error('Erro ao buscar itens pendentes: ', error)

    return { pendingItems: data as PrintQueueType[] }
  })

export const readPrinterByName = adminProcedure
  .createServerAction()
  .input(z.object({ name: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('printers')
      .select('*')
      .eq('name', input.name)
      .eq('store_id', store.id)
      .single()

    if (error) {
      console.error('Erro ao buscar impressora pelo nome: ', error)
    }

    return { printer: data as PrinterType }
  })

export const printTableReceipt = createServerAction()
  .input(
    z.object({
      tableId: z.string().optional(),
      printerName: z.string().optional(),
      reprint: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [[tableData], [printSettingsData], [printersData]] =
      await Promise.all([
        readTableById({ id: input.tableId }),
        readPrintingSettings(),
        readPrinters(),
      ])

    const table = tableData?.table
    const printers = printersData?.printers || []
    const printingSettings = printSettingsData?.printingSettings
    const fontSize = printSettingsData?.printingSettings?.kitchen_font_size

    if (!printingSettings?.auto_print) {
      return
    }

    if (!printers.length) {
      return new Response('Nenhuma impressora encontrada', { status: 404 })
    }

    const result = {
      kitchenPrinted: false,
      deliveryPrinted: false,
      errors: [] as string[],
    }

    for (const printer of printers) {
      try {
        if (
          printer.sectors.length === 0 ||
          printer.sectors.includes('kitchen')
        ) {
          const textKitchen = buildReceiptTableText(table, input.reprint)

          await addToPrintQueue([
            {
              text: textKitchen,
              font_size: fontSize,
              printer_name: printer.name,
            },
          ])

          result.kitchenPrinted = true
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        result.errors.push(`Erro na impressora "${printer.name}": ${errorMsg}`)
        console.error(errorMsg)
      }
    }

    return {
      success: result.kitchenPrinted || result.deliveryPrinted,
      ...result,
    }
  })

export const printPurchaseReceipt = createServerAction()
  .input(
    z.object({
      purchaseId: z.string().optional(),
      purchaseType: z.enum(['DELIVERY', 'TAKEOUT']).optional(),
      reprint: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ input }) => {
    const [[purchaseData], [printSettingsData], [printersData]] =
      await Promise.all([
        readPurchaseById({ id: input.purchaseId ?? '' }),
        readPrintingSettings(),
        readPrinters(),
      ])

    const purchase = purchaseData?.purchase ?? purchaseTest
    const printers = printersData?.printers || []
    const printingSettings = printSettingsData?.printingSettings
    const kitchenFontSize = printingSettings?.kitchen_font_size
    const deliveryFontSize = printingSettings?.font_size

    const isDelivery = input.purchaseType === 'DELIVERY'

    if (!printers.length) {
      return new Response('Nenhuma impressora encontrada', { status: 404 })
    }

    const result = {
      kitchenPrinted: false,
      deliveryPrinted: false,
      errors: [] as string[],
    }

    for (const printer of printers) {
      try {
        if (
          printer.sectors.length === 0 ||
          printer.sectors.includes('kitchen')
        ) {
          const textKitchen = buildReceiptKitchenText(purchase, input.reprint)

          await addToPrintQueue([
            {
              text: textKitchen,
              font_size: kitchenFontSize,
              printer_name: printer.name,
            },
          ])

          result.kitchenPrinted = true
        }

        if (
          (isDelivery && printer.sectors.length === 0) ||
          printer.sectors.includes('delivery')
        ) {
          const textDelivery = buildReceiptDeliveryText(purchase, input.reprint)

          await addToPrintQueue([
            {
              text: textDelivery,
              font_size: deliveryFontSize,
              printer_name: printer.name,
            },
          ])

          result.deliveryPrinted = true
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        result.errors.push(`Erro na impressora "${printer.name}": ${errorMsg}`)
        console.error(errorMsg)
      }
    }

    return {
      success: result.kitchenPrinted || result.deliveryPrinted,
      ...result,
    }
  })

export const printReportReceipt = createServerAction()
  .input(
    z.object({
      text: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const [[printerData], [printSettingsData]] = await Promise.all([
      readPrinters(),
      readPrintingSettings(),
    ])

    const printers = printerData?.printers
    const fontSize = printSettingsData?.printingSettings?.font_size

    if (!printers) {
      throw new Error('Impressora não encontrada')
    }

    for (const printer of printers) {
      if (printer.sectors.length > 0 && !printer.sectors.includes('delivery')) {
        return { success: false, skipped: true }
      }

      try {
        await addToPrintQueue([
          {
            text: input.text,
            font_size: fontSize,
            printer_name: printer.name,
          },
        ])
      } catch (error) {
        throw new Error('Erro ao verificar extensão', error as Error)
      }
    }
    // Se setores definidos e "kitchen" não incluso, não imprime
  })

export const printMultipleReports = createServerAction()
  .input(
    z.object({
      reports: z.array(
        z.object({
          text: z.string(),
          name: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ input }) => {
    console.log(
      'Iniciando impressão de múltiplos relatórios:',
      input.reports.length,
    )

    const [[printerData], [printSettingsData]] = await Promise.all([
      readPrinters(),
      readPrintingSettings(),
    ])

    const printers = printerData?.printers
    const fontSize = printSettingsData?.printingSettings?.font_size

    if (!printers) {
      throw new Error('Impressora não encontrada')
    }

    const results = []
    let successfulReports = 0
    const totalReports = input.reports.length

    for (const report of input.reports) {
      console.log(`Imprimindo relatório: ${report.name}`)

      try {
        for (const printer of printers) {
          if (
            printer.sectors.length > 0 &&
            !printer.sectors.includes('delivery')
          ) {
            console.log(
              `Pulando impressora ${printer.name} - setor não compatível`,
            )
            continue
          }

          await addToPrintQueue([
            {
              text: report.text,
              font_size: fontSize,
              printer_name: printer.name,
            },
          ])

          console.log(
            `Relatório "${report.name}" enviado para impressora ${printer.name}`,
          )
        }

        results.push({ name: report.name, success: true })
        successfulReports++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`Erro ao imprimir relatório "${report.name}":`, errorMsg)
        results.push({ name: report.name, success: false, error: errorMsg })
      }
    }

    console.log(
      `Impressão concluída: ${successfulReports}/${totalReports} relatórios impressos com sucesso`,
    )

    return {
      success: successfulReports > 0,
      results,
      totalReports,
      successfulReports,
    }
  })

export const readPrintingSettings = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data, error } = await supabase
      .from('printer_settings')
      .select('*')
      .eq('store_id', store.id)
      .single()

    if (error || !data) {
      console.error('Erro ao buscar configurações de impressão: ', error)
    }

    return { printingSettings: data as PrintingSettingsType }
  })

export const upsertPrintingSettings = adminProcedure
  .createServerAction()
  .input(printingSettingsSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const [printingSettingsData] = await readPrintingSettings()

    const printingSettings = printingSettingsData?.printingSettings

    const test = { id: printingSettings?.id, store_id: store.id, ...input }

    const { error } = await supabase.from('printer_settings').upsert(test)

    if (error) {
      console.error('Erro ao configurar impressão: ', error)
    }
  })

export const readAvailablePrinters = createServerAction().handler(async () => {
  try {
    const res = await fetch('http://127.0.0.1:53281/printers', {
      method: 'GET',
    })

    if (!res.ok) {
      const text = await res.text() // tenta capturar erro bruto
      throw new Error(`Erro HTTP ${res.status}: ${text}`)
    }

    const data = await res.json()

    return data
  } catch (error) {
    console.error('Erro ao verificar extensão', error)
    return { success: false, error: (error as Error).message }
  }
})

export const readPrinters = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data, error } = await supabase
      .from('printers')
      .select('*')
      .eq('store_id', store.id)

    if (error) {
      console.error('Erro ao buscar impressoras', error)
      return
    }

    return { printers: data as PrinterType[] }
  })

export const createPrinter = adminProcedure
  .createServerAction()
  .input(printerSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    if (!input.id) {
      const existing = await supabase
        .from('printers')
        .select('id')
        .eq('store_id', store.id)
        .eq('name', input.name)
        .single()

      if (existing.data) {
        throw new Error('Já existe uma impressora com esse nome nesta loja.')
      }
    }

    const { error } = await supabase
      .from('printers')
      .upsert({ ...input, store_id: store.id, id: input.id })
      .eq('store_id', store.id)

    if (error) {
      console.error('Erro ao criar impressora', error)
      return
    }

    revalidatePath('/admin/config/printing')
  })

export const deletePrinter = adminProcedure
  .createServerAction()
  .input(printerSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('printers')
      .delete()
      .eq('id', input.id)

    if (error) {
      console.error('Erro ao deletar Impressora: ', error)
    }

    revalidatePath('/admin/config/printing')
  })

export const readPrintPendingItemsCached = cache(readPrintPendingItems)
export const readPrinterByNameCached = cache(readPrinterByName)
export const readPrintingSettingsCached = cache(readPrintingSettings)
export const readPrintersCached = cache(readPrinters)
