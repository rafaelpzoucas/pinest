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

export const printTableReceipt = createServerAction()
  .input(
    z.object({
      tableId: z.string().optional(),
      printerName: z.string(),
      reprint: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [tableData] = await readTableById({ id: input.tableId })

    const table = tableData?.table
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
      purchaseId: z.string(),
      printerName: z.string(),
      reprint: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [purchaseData] = await readPurchaseById({ id: input.purchaseId })

    const purchase = purchaseData?.purchase
    const textKitchen = buildReceiptKitchenText(purchase, input.reprint)
    const textDelivery = buildReceiptDeliveryText(purchase, input.reprint)

    try {
      const resKitchen = await fetch('http://localhost:53281/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textKitchen,
          printerName: input.printerName,
        }),
      })

      const resDelivery = await fetch('http://localhost:53281/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textDelivery,
          printerName: input.printerName,
        }),
      })

      if (!resKitchen.ok || !resDelivery.ok) {
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

    const { error } = await supabase
      .from('printers')
      .insert({ ...input, store_id: store.id })
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
