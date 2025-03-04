'use client'

import { useEffect } from 'react'

export function Printer() {
  useEffect(() => {
    const handleAfterPrint = () => {
      window.close()
    }

    // Adiciona o listener para o evento afterprint
    window.addEventListener('afterprint', handleAfterPrint)

    // Inicia a impressão
    window.print()

    // Remove o listener após o uso para evitar múltiplos ouvintes
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  return <></>
}
