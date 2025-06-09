'use server'

import {
  buildReceiptDeliveryText,
  buildReceiptKitchenText,
  buildReceiptTableText,
} from '@/lib/receipts'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
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
} from './schemas'

export const checkPrinterExtension = createServerAction().handler(async () => {
  try {
    const res = await fetch('http://localhost:53281/printers', {
      method: 'GET',
    })

    if (!res.ok) {
      const text = await res.text() // tenta capturar erro bruto
      throw new Error(`Erro HTTP ${res.status}: ${text}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao verificar extensão', error)
    return { success: false, error: (error as Error).message }
  }
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
      printerName: z.string(),
      reprint: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [[tableData], [printerData]] = await Promise.all([
      readTableById({ id: input.tableId }),
      readPrinterByName({ name: input.printerName }),
    ])

    const table = tableData?.table
    const printer = printerData?.printer
    if (!printer) {
      return new Response('Impressora não encontrada', { status: 404 })
    }

    // Se setores definidos e "kitchen" não incluso, não imprime
    if (printer.sectors.length > 0 && !printer.sectors.includes('kitchen')) {
      return { success: false, skipped: true }
    }

    const textKitchen = buildReceiptTableText(table, input.reprint)

    try {
      const resKitchen = await fetch('http://localhost:53281/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textKitchen,
          printerName: input.printerName,
        }),
      })

      if (!resKitchen.ok) {
        return new Response('Erro ao enviar para impressora', { status: 500 })
      }
    } catch (error) {
      console.error('Erro ao verificar extensão', error)
      return { success: false, error: (error as Error).message }
    }
  })

export const printPurchaseReceipt = createServerAction()
  .input(
    z.object({
      purchaseId: z.string().optional(),
      printerName: z.string(),
      reprint: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [[purchaseData], [printSettingsData], [printerData]] =
      await Promise.all([
        readPurchaseById({ id: input.purchaseId ?? '' }),
        readPrintingSettings(),
        readPrinterByName({ name: input.printerName }),
      ])

    const purchase = purchaseData?.purchase ?? purchaseTest
    const printer = printerData?.printer
    const fontSize = printSettingsData?.printingSettings?.font_size

    if (!printer) {
      return new Response('Impressora não encontrada', { status: 404 })
    }

    // Resultado parcial
    const result = {
      kitchenPrinted: false,
      deliveryPrinted: false,
    }

    try {
      if (printer.sectors.length === 0 || printer.sectors.includes('kitchen')) {
        const textKitchen = buildReceiptKitchenText(purchase, input.reprint)

        const resKitchen = await fetch('http://localhost:53281/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textKitchen,
            printerName: input.printerName,
            fontSize,
          }),
        })

        if (!resKitchen.ok) throw new Error('Erro ao imprimir na cozinha')
        result.kitchenPrinted = true
      }

      if (
        printer.sectors.length === 0 ||
        printer.sectors.includes('delivery')
      ) {
        const textDelivery = buildReceiptDeliveryText(purchase, input.reprint)

        const resDelivery = await fetch('http://localhost:53281/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textDelivery,
            printerName: input.printerName,
            fontSize,
          }),
        })

        if (!resDelivery.ok) throw new Error('Erro ao imprimir delivery')
        result.deliveryPrinted = true
      }

      return { success: true, ...result }
    } catch (error) {
      console.error('Erro ao verificar extensão', error)
      return { success: false, error: (error as Error).message, ...result }
    }
  })

export const printReportReceipt = createServerAction()
  .input(
    z.object({
      text: z.string(),
      printerName: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const [[printerData]] = await Promise.all([
      readPrinterByName({ name: input.printerName }),
    ])

    const printer = printerData?.printer
    if (!printer) {
      return new Response('Impressora não encontrada', { status: 404 })
    }

    // Se setores definidos e "kitchen" não incluso, não imprime
    if (printer.sectors.length > 0 && !printer.sectors.includes('balcony')) {
      return { success: false, skipped: true }
    }

    try {
      const resKitchen = await fetch('http://localhost:53281/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input.text,
          printerName: input.printerName,
        }),
      })

      if (!resKitchen.ok) {
        return new Response('Erro ao enviar para impressora', { status: 500 })
      }
    } catch (error) {
      console.error('Erro ao verificar extensão', error)
      return { success: false, error: (error as Error).message }
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
    const res = await fetch('http://localhost:53281/printers', {
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
