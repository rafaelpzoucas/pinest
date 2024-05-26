import { Island } from '@/components/island'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import burgerImg from '../../../../../public/teste/burger.jpg'
import { ProductDataType } from '../../product-card'
import { CartProduct } from './cart-product'
import { FinalizePurchaseDrawer } from './finalize-purchase/drawer'

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

export default function CartPage({
  params,
}: {
  params: { public_store: string }
}) {
  const productsPrice = bagItems.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd
  }, 0)

  return (
    <main className="p-4 pb-40">
      <header className="grid grid-cols-[1fr_5fr_1fr] items-center pb-4">
        <Link
          href={`/${params.public_store}`}
          className={buttonVariants({ variant: 'secondary', size: 'icon' })}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <h1 className="text-xl text-center font-bold">Finalizar compra</h1>
      </header>

      <section className="flex flex-col gap-2">
        {bagItems.map((product) => (
          <CartProduct product={product} key={product.title} />
        ))}

        <Link
          href={`/${params.public_store}`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar mais itens
        </Link>
      </section>

      <Island>
        <div className="flex flex-col gap-2 w-full">
          <Card className="p-4 w-full space-y-2">
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Produtos ({bagItems.length})</p>
              <span>{formatCurrencyBRL(productsPrice)}</span>
            </div>

            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Frete</p>
              <span className="text-emerald-600">Grátis</span>
            </div>

            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <Button variant={'link'} className="p-0">
                Inserir cupom
              </Button>
            </div>

            <div className="flex flex-row justify-between text-sm pb-2">
              <p>Total</p>
              <strong>{formatCurrencyBRL(productsPrice - 0)}</strong>
            </div>

            <FinalizePurchaseDrawer />
          </Card>
        </div>
      </Island>
    </main>
  )
}
