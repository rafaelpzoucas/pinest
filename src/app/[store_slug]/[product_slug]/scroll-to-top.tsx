'use client'

import { useEffect } from 'react'

export function ScrollToTop() {
  useEffect(() => {
    // Múltiplas tentativas para garantir que o scroll funcione
    const scrollToTop = () => {
      // Diferentes métodos para garantir compatibilidade
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Execução imediata
    scrollToTop()

    // Backup com requestAnimationFrame
    requestAnimationFrame(scrollToTop)

    // Backup com timeout
    const timeouts = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100),
    ]

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return null
}
