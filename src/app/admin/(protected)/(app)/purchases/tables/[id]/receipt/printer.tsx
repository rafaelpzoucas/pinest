'use client'

import { useEffect } from 'react'
import { useServerAction } from 'zsa-react'
import { updateTablePrintedItems } from '../actions'

export function Printer({ tableId }: { tableId: string }) {
  const { execute } = useServerAction(updateTablePrintedItems, {
    onSuccess: () => {
      window.close()
    },
  })

  useEffect(() => {
    window.onafterprint = () => {
      execute({ tableId })
    }

    window.print()

    return () => {
      window.onafterprint = null
    }
  }, [tableId])

  return null
}
