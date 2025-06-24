'use client'

import { checkPrinterExtension } from '@/app/admin/(protected)/(app)/config/printing/actions'
import { usePrinterExtensionStore } from '@/stores/printerExtensionStore'
import { useEffect } from 'react'
import { useServerAction } from 'zsa-react'

export function PrinterExtensionStatusPoller() {
  const { setIsActive } = usePrinterExtensionStore()

  const { execute } = useServerAction(checkPrinterExtension, {
    onSuccess: ({ data }) => {
      setIsActive(data.success)
    },
    onError: ({ err }) => {
      setIsActive(false)
      console.log('Erro ao verificar extensão: ', err)
    },
  })

  useEffect(() => {
    let isMounted = true
    let isExecuting = false

    const check = async () => {
      if (isExecuting) return
      isExecuting = true
      try {
        await execute()
      } finally {
        isExecuting = false
      }
    }

    check()

    const interval = setInterval(() => {
      if (isMounted) check()
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [execute])

  return null
}
