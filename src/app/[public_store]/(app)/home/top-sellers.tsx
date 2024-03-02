import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ProductCard, ProductDataType } from './product-card'

import burgerImg from '../../../../../public/teste/burger.jpg'

const topSellers: ProductDataType[] = [
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

export function TopSellers() {
  return (
    <section className="space-y-4 p-4">
      <h1 className="text-lg font-bold uppercase">Mais vendidos</h1>

      <Carousel>
        <CarouselContent>
          {topSellers.map((product) => (
            <CarouselItem className="flex-[0_0_40%]" key={product.title}>
              <ProductCard variant={'featured'} data={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
