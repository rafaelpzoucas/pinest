import { ProductCard } from './product-card'

import Link from 'next/link'
import burgerImg from '../../../public/teste/burger.jpg'
import drinkImg from '../../../public/teste/coca.webp'
import dessertImg from '../../../public/teste/doce.jpg'

export function ProductsList() {
  const categories = [
    {
      title: 'Lanches',
      description:
        'Deliciosos lanches preparados com ingredientes frescos e de alta qualidade.',
      products: [
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
          title: 'Wrap de Vegetais Grelhados',
          description:
            'Um wrap vegetariano recheado com uma mistura de vegetais grelhados, incluindo abobrinha, pimentão, cebola, cogumelos e espinafre fresco, tudo temperado com ervas mediterrâneas e servido com molho de iogurte.',
          price: 25.0,
          promotional_price: 20.0,
        },
        // Adicione aqui mais produtos de lanches
      ],
    },
    {
      title: 'Sobremesas',
      description: 'Doces irresistíveis para satisfazer sua vontade de açúcar.',
      products: [
        {
          thumb_url: dessertImg,
          title: 'Cheesecake de Morango',
          description:
            'Um cheesecake cremoso e indulgente, com uma base crocante de biscoito, coberto com um delicioso creme de queijo e decorado com generosas fatias de morango fresco.',
          price: 15.0,
          promotional_price: 12.0,
        },
        {
          thumb_url: dessertImg,
          title: 'Brownie de Chocolate',
          description:
            'Um brownie de chocolate rico e decadente, feito com cacau de alta qualidade e pedaços generosos de chocolate meio amargo, servido quente e acompanhado de uma bola de sorvete de baunilha.',
          price: 10.0,
          promotional_price: 8.0,
        },
        // Adicione aqui mais produtos de sobremesas
      ],
    },
    {
      title: 'Bebidas',
      description:
        'Bebidas refrescantes e saborosas para acompanhar sua refeição.',
      products: [
        {
          thumb_url: drinkImg,
          title: 'Smoothie de Frutas Tropicais',
          description:
            'Um smoothie refrescante e saudável feito com uma mistura de frutas tropicais frescas, como manga, abacaxi e banana, combinadas com suco de laranja e iogurte natural.',
          price: 7.0,
          promotional_price: 6.0,
        },
        {
          thumb_url: drinkImg,
          title: 'Café Gelado',
          description:
            'Um café gelado cremoso e encorpado, feito com café expresso forte, leite gelado, e um toque de xarope de baunilha, perfeito para refrescar em dias quentes.',
          price: 5.0,
          promotional_price: 4.0,
        },
        // Adicione aqui mais produtos de bebidas
      ],
    },
    // Adicione mais categorias conforme necessário
  ]

  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      {categories.map((category) => (
        <div
          id={category.title}
          className="flex flex-col px-4"
          key={category.title}
        >
          <div className="py-4 bg-background">
            <h1 className="text-xl uppercase font-bold">{category.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {category.products.map((product) => (
              <Link
                key={product.title}
                href={`/loja-teste/products/${product.title}`}
              >
                <ProductCard variant={'featured'} data={product} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
