'use client'

import { Card } from '@/components/ui/card'
import { ShoppingBag as Bag } from 'lucide-react'
import Link from 'next/link'
import burgerImg from '../../../../public/teste/burger.jpg'
import { ProductDataType } from '../product-card'

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

export function ShoppingBagIsland() {
  return (
    <Link href="/loja-teste/cart">
      <Card className="flex flex-row items-center gap-3 p-3 w-full text-sm bg-primary text-primary-foreground">
        <Bag className="w-5 h-5" />
        <strong>Ver sacola ({1})</strong>

        <strong className="ml-auto">R$ 60,00</strong>
      </Card>
    </Link>
  )
}
