import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, DollarSign, MapPin, ScrollText } from 'lucide-react'
import { ProductDataType } from '../../home/product-card'

import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/format-number'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import burgerImg from '../../../../../../public/teste/burger.jpg'

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

export function Confirm() {
  const searchParams = useSearchParams()
  const selectedStep = searchParams.get('step')
  const selectedPickup = searchParams.get('pickup')
  const selectedAddress = searchParams.get('address')
  const selectedPayment = searchParams.get('payment')

  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="grid grid-cols-[1fr_5fr_1fr] items-center w-full py-2">
        {/* <Link href="?step=pickup" className="flex flex-row items-center p-2"> */}
        <ArrowLeft className="w-5 h-5" />
        {/* </Link> */}
        <h1 className="text-center text-lg font-bold w-full">
          Confirme sua compra
        </h1>
      </header>

      <ScrollArea className="h-[450px]">
        <div className="flex flex-col">
          <Card className="flex flex-col p-4 w-full space-y-2">
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Produtos ({bagItems.length})</p>
              <span>{formatCurrency(100)}</span>
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

            <div className="flex flex-row justify-between text-sm pb-4">
              <p>Você pagará</p>
              <strong>{formatCurrency(100 - 0)}</strong>
            </div>

            <Button>Confirmar compra</Button>
          </Card>

          <section className="flex flex-col items-center gap-2 text-center border-b py-6">
            <MapPin />
            <p>Rua Santa Cruz, 801</p>
            <span className="text-xs text-muted-foreground">
              CEP 19800-320 - Centro - Assis, São Paulo
            </span>

            <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
              Editar ou escolher outro
            </Link>
          </section>

          <section className="flex flex-col items-center gap-2 text-center border-b py-6">
            <DollarSign />
            <p>Você pagará {formatCurrency(100)} com Pix</p>
            <span className="text-xs text-muted-foreground">
              Os pagamentos com este meio são aprovados na hora
            </span>

            <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
              Alterar meio de pagamento
            </Link>
          </section>

          <section className="flex flex-col items-center gap-2 text-center border-b py-6">
            <ScrollText />
            <p>Dados para Nota Fiscal eletrônica</p>
            <span className="text-xs text-muted-foreground">
              Rafael Ricardo Pinheiro Zoucas - CPF 46651341898
            </span>

            <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
              Alterar dados
            </Link>
          </section>

          <Button>Confirmar compra</Button>
        </div>
      </ScrollArea>
    </section>
  )
}
