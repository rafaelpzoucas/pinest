'use client'

import { Island } from '@/components/island'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, ScrollText } from 'lucide-react'
import burgerImg from '../../../public/teste/burger.jpg'
import { ShoppingBagIsland } from './(app)/shopping-bag'
import { HeaderDeliveryInfo } from './header-delivery-info'
import { ProductDataType } from './product-card'
import { ProductsList } from './products-list'
import { Promotions } from './promotions'
import { Search } from './search'
import { TopSellers } from './top-sellers'

const bagItems: ProductDataType[] = [
  {
    thumb_url: burgerImg,
    title: 'Hambúrguer Artesanal',
    description:
      'Delicioso hambúrguer artesanal feito com carne angus, queijo cheddar derretido, alface crocante, tomate fresco e molho especial, tudo servido em um pão brioche levemente tostado.',
    price: 50.0,
    promotional_price: 0,
  },
  {
    thumb_url: burgerImg,
    title: 'Sanduíche de Frango Grelhado',
    description:
      'Um sanduíche de frango grelhado preparado com peito de frango suculento marinado em temperos especiais, acompanhado de alface, tomate, cebola roxa, maionese de ervas e servido em um pão integral tostado.',
    price: 35.0,
    promotional_price: 30.0,
  },
  {
    thumb_url: burgerImg,
    title: 'Salada Caesar com Frango',
    description:
      'Uma salada Caesar clássica com frango grelhado, folhas de alface frescas, croutons crocantes, queijo parmesão ralado e molho Caesar caseiro, uma opção leve e deliciosa para uma refeição equilibrada.',
    price: 70.0,
    promotional_price: 60.0,
  },
  {
    thumb_url: burgerImg,
    title: 'Wrap de Vegetais Grelhados',
    description:
      'Um wrap vegetariano recheado com uma mistura de vegetais grelhados, incluindo abobrinha, pimentão, cebola, cogumelos e espinafre fresco, tudo temperado com ervas mediterrâneas e servido com molho de iogurte.',
    price: 25.0,
    promotional_price: 20.0,
  },
]

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
            <ScrollText className="w-5 h-5" />
          </Button>
          <Button variant={'ghost'} size={'icon'}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <Search />

      <Promotions />

      <TopSellers />

      <ProductsList />

      {bagItems.length > 0 && (
        <Island>
          <ShoppingBagIsland />
        </Island>
      )}
    </main>
  )
}
