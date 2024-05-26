import { Island } from '@/components/island'
import Image from 'next/image'
import burgerImg from '../../../public/teste/burger.jpg'
import vercel from '../../../public/vercel.svg'
import { ShoppingBagIsland } from './(app)/shopping-bag'
import { getStores } from './actions'
import { Menu } from './menu'
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

export default async function HomePage({
  params,
}: {
  params: { public_store: string }
}) {
  const { stores, error } = await getStores(params.public_store)

  if (error) {
    console.log(error)
  }

  const store = stores && stores[0]

  return (
    <main>
      <div className="p-2">
        <header className="relative p-4 py-4 bg-primary/80 rounded-2xl">
          <div className="flex flex-row items-center justify-between">
            <div className="relative w-full h-8 max-w-40">
              <Image
                src={vercel}
                fill
                alt=""
                className="object-contain object-left"
              />
            </div>

            <div className="flex flex-row gap-2">
              <Menu />
            </div>
          </div>
        </header>
      </div>

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
