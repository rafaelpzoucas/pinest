'use client'

import { useEffect } from 'react'
import { useServerAction } from 'zsa-react'
import { updatePurchasePrintedItems } from '../actions'

export function Printer({ purchaseId }: { purchaseId: string }) {
  const { execute } = useServerAction(updatePurchasePrintedItems, {
    onSuccess: () => {
      window.location.href = `/admin/purchases/deliveries/${purchaseId}/receipt/delivery`
    },
  })

  useEffect(() => {
    window.onafterprint = () => {
      execute({ purchaseId })
    }

    window.print()

    return () => {
      window.onafterprint = null
    }
  }, [purchaseId])

  return null
}
