import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, CornerDownRight } from 'lucide-react'
import Link from 'next/link'
import { OrderDataType } from '../orders'
import { Header } from './header'

export default function OrderPage({ order }: { order: OrderDataType }) {
  return (
    <main>
      <div>
        <Header order={order} />

        <div className="flex flex-col gap-6 p-4">
          <Card className="flex flex-col gap-2 p-4">
            <div className="flex flex-row items-center justify-between text-sm">
              <strong>Total da venda</strong>
              <strong>R$ 95,00</strong>
            </div>
            <div className="flex flex-row items-center justify-between text-xs text-muted-foreground">
              <span>
                Troco para <strong>R$ 100,00</strong>
              </span>
              <strong>R$ 50,00</strong>
            </div>
            <div className="flex flex-row items-center justify-between text-xs text-muted-foreground">
              <span>Desconto</span>
              <strong>-R$ 5,00</strong>
            </div>
            <Button className="mt-2">Despachar</Button>
          </Card>

          <section className="flex flex-col gap-2">
            <h1 className="text-lg font-bold">Cliente</h1>
            <Link href="/customers/id_do_cliente">
              <Card className="p-4">
                <header className="flex flex-row gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-1">
                    <strong>{'order.customer_name'}</strong>
                    <p className="text-xs text-muted-foreground">
                      Telefone: +5518998261736
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Endereço: Rua Santa Cruz, 801
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </header>
              </Card>
            </Link>
          </section>

          <section className="flex flex-col gap-2">
            <h1 className="text-lg font-bold">Itens do pedido</h1>

            <div className="flex flex-col gap-2">
              <Card className="p-4 space-y-2">
                <header className="flex flex-row items-center justify-between text-sm">
                  <strong>x1 Smartphone XYZ</strong>
                  <span>R$ 1000,00</span>
                </header>

                <div>
                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>

                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>
                </div>

                <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                  <strong>OBS:</strong>
                  <span>Observação para levar algo</span>
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <header className="flex flex-row items-center justify-between text-sm">
                  <strong>x1 Smartphone XYZ</strong>
                  <span>R$ 1000,00</span>
                </header>

                <div>
                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>

                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>
                </div>

                <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                  <strong>OBS:</strong>
                  <span>Observação para levar algo</span>
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <header className="flex flex-row items-center justify-between text-sm">
                  <strong>x1 Smartphone XYZ</strong>
                  <span>R$ 1000,00</span>
                </header>

                <div>
                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>

                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>
                </div>

                <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                  <strong>OBS:</strong>
                  <span>Observação para levar algo</span>
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <header className="flex flex-row items-center justify-between text-sm">
                  <strong>x1 Smartphone XYZ</strong>
                  <span>R$ 1000,00</span>
                </header>

                <div>
                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>

                  <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                    <CornerDownRight className="w-4 h-4" />
                    <span>x1 Adicionais</span>
                  </div>
                </div>

                <div className="flex flex-row gap-1 text-sm text-muted-foreground">
                  <strong>OBS:</strong>
                  <span>Observação para levar algo</span>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
