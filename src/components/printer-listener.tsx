'use client'

import {
  printQueueItem,
  readPrintPendingItems,
} from '@/app/admin/(protected)/(app)/config/printing/actions'
import { PrintQueueType } from '@/app/admin/(protected)/(app)/config/printing/schemas'
import { createClient } from '@/lib/supabase/client'
import { usePrinterExtensionStore } from '@/stores/printerExtensionStore'
import { useEffect, useRef } from 'react'
import { useServerAction } from 'zsa-react'
import { PrinterExtensionStatusPoller } from './printer-extension'

export default function PrintQueueListener() {
  const supabase = createClient()

  const { isActive } = usePrinterExtensionStore()
  const wasActive = useRef(false)

  const { execute: executePrintItem } = useServerAction(printQueueItem, {
    onError: (error) => {
      console.error(
        '[PrintQueueListener] Falha ao processar item da fila de impressão:',
        error,
      )
    },
  })

  const { execute: executeReadPendingItems } = useServerAction(
    readPrintPendingItems,
    {
      onSuccess: ({ data }) => {
        if (data) {
          for (const item of data.pendingItems as PrintQueueType[]) {
            executePrintItem({
              id: item.id,
              printer_name: item.printer_name,
              text: item.text,
              font_size: item.font_size,
            })
          }
        }
      },
      onError: (error) => {
        console.error(
          '[PrintQueueListener] Erro ao buscar itens pendentes da fila de impressão:',
          error,
        )
      },
    },
  )

  useEffect(() => {
    const channel = supabase
      .channel('print_queue_insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'print_queue',
        },
        (payload) => {
          try {
            const newItem = payload.new as PrintQueueType
            executePrintItem({
              id: newItem.id,
              printer_name: newItem.printer_name,
              text: newItem.text,
              font_size: newItem.font_size,
            })
          } catch (error) {
            console.error(
              '[PrintQueueListener] Erro ao processar evento INSERT do Supabase:',
              error,
            )
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // Buscar pendentes sempre que a extensão "voltar a ficar ativa"
  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        executeReadPendingItems()
      } catch (error) {
        console.error(
          '[PrintQueueListener] Erro ao buscar itens pendentes após reativação da extensão:',
          error,
        )
      }
    }

    // Detecta transição de offline -> online
    if (isActive && !wasActive.current) {
      fetchPendingItems()
    }

    wasActive.current = isActive
  }, [isActive])

  return <PrinterExtensionStatusPoller />
}
