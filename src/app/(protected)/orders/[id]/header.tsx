'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { OrderDataType } from '../orders'

type HeaderPropsType = {
  order: OrderDataType
}

export function Header({ order }: HeaderPropsType) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-10 flex flex-row items-center gap-3 p-4 bg-background">
      <Button variant={'ghost'} size={'icon'} onClick={() => router.back()}>
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex flex-col">
        <strong>Pedido #{'order.order_id'}</strong>
        <span className="text-xs text-muted-foreground">
          {'order.created_at'}
        </span>
      </div>

      <Badge>{'order.status'}</Badge>
    </header>
  )
}
