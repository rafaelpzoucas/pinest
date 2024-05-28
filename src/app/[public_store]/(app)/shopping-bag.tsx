'use client'

import { Card } from '@/components/ui/card'
import { ShoppingBag as Bag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ShoppingBagIsland() {
  const pathname = usePathname()

  return (
    <Link href={`${pathname}/cart`}>
      <Card className="flex flex-row items-center gap-3 p-3 w-full text-sm bg-primary text-primary-foreground">
        <Bag className="w-5 h-5" />
        <strong>Ver sacola ({1})</strong>

        <strong className="ml-auto">R$ 60,00</strong>
      </Card>
    </Link>
  )
}
