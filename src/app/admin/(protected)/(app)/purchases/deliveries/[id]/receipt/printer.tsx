'use client'

import { useEffect } from 'react'

export function Printer({ purchaseId }: { purchaseId: string }) {
  useEffect(() => {
    window.onafterprint = () => {
      window.location.href = `/admin/purchases/deliveries/${purchaseId}/receipt/delivery`
    }

    window.print()

    return () => {
      window.onafterprint = null
    }
  }, [purchaseId])

  return null
}
