'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, ScrollText } from 'lucide-react'
import { HeaderDeliveryInfo } from './header-delivery-info'
import { ProductsList } from './products-list'
import { Promotions } from './promotions'
import { Search } from './search'
import { TopSellers } from './top-sellers'

export default function HomePage() {
  return (
    <main>
      <header className="relative p-4 py-6 bg-secondary">
        <div className="flex flex-col gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div>
            <strong className="line-clamp-1 max-w-[235px]">
              Cantinho do Hot Dog
            </strong>

            <div className="flex flex-row gap-2 text-xs text-muted-foreground mt-1">
              <strong className="text-emerald-600 uppercase whitespace-nowrap">
                Aberto agora
              </strong>
              <span>&bull;</span>
              <span className="whitespace-nowrap">Fecha em 20min</span>
            </div>
          </div>
        </div>

        <HeaderDeliveryInfo />

        <div className="absolute top-4 right-4 flex flex-row gap-3">
          <Button variant={'ghost'} size={'icon'}>
            <ScrollText />
          </Button>
          <Button variant={'ghost'} size={'icon'}>
            <Menu />
          </Button>
        </div>
      </header>

      <Search />

      <Promotions />

      <TopSellers />

      <ProductsList />
    </main>
  )
}
