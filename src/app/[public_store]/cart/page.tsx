import { Island } from '@/components/island'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ProductType } from '@/models/product'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { CartProduct } from './cart-product'
import { FinalizePurchaseDrawer } from './finalize-purchase/drawer'

const bagItems: ProductType[] = [
  {
    thumb_url: null,
    name: 'Hambúrguer Artesanal',
    description:
      'Delicioso hambúrguer artesanal feito com carne angus, queijo cheddar derretido, alface crocante, tomate fresco e molho especial, tudo servido em um pão brioche levemente tostado.',
    price: 50.0,
    promotional_price: 0,
    stock: 100,
    id: 'qwer',
    category_id: 'asdfasdf',
    created_at: '2024-05-28 11:00:00',
  },
  {
    thumb_url: null,
    name: 'Sanduíche de Frango Grelhado',
    description:
      'Um sanduíche de frango grelhado preparado com peito de frango suculento marinado em temperos especiais, acompanhado de alface, tomate, cebola roxa, maionese de ervas e servido em um pão integral tostado.',
    price: 35.0,
    promotional_price: 30.0,
    stock: 100,
    id: 'qwert',
    category_id: 'asdofasdfi',
    created_at: '2024-05-28 11:00:00',
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
          <CartProduct product={product} key={product.name} />
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
