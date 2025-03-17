'use client'

import { useEffect } from 'react'

export function Printer({ tableId }: { tableId: string }) {
  useEffect(() => {
    window.onafterprint = () => {
      window.close()
    }

    window.print()

    return () => {
      window.onafterprint = null
    }
  }, [tableId])

  return null
}
