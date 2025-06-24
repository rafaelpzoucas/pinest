'use client'

import { usePrinterExtensionStore } from '@/stores/printerExtensionStore'
import { useEffect } from 'react'

export function PrinterExtensionStatusPoller() {
  const { setIsActive } = usePrinterExtensionStore()

  async function checkPrinterExtension() {
    try {
      const res = await fetch('http://127.0.0.1:53281/ping', {
        method: 'GET',
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Erro HTTP ${res.status}: ${text}`)
      }

      setIsActive(true)
      return { success: true }
    } catch (error) {
      setIsActive(false)

      console.error('Erro ao verificar extensão', error)

      return { success: false, error: (error as Error).message }
    }
  }

  useEffect(() => {
    let isMounted = true
    let isExecuting = false

    const check = async () => {
      if (isExecuting) return
      isExecuting = true
      try {
        await checkPrinterExtension()
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
  }, [checkPrinterExtension])

  return null
}
