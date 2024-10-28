'use client'

import useScrollDirection from '@/hooks/useScrollDirection'
import { ReactNode } from 'react'

export function SearchIsland({ children }: { children: ReactNode }) {
  const scrollDirection = useScrollDirection()

  return (
    <section
      data-hidden={scrollDirection === 'down'}
      className="sticky top-0 z-20 flex lg:hidden flex-col bg-background py-4
        data-[hidden=true]:-translate-y-[100%] transition-all duration-200"
    >
      {children}
    </section>
  )
}
