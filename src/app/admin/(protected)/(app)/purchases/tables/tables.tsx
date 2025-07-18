import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { TableType } from '@/models/table'
import { useCashRegister } from '@/stores/cashRegisterStore'
import {
  ArrowLeft,
  Asterisk,
  BadgeDollarSign,
  Edit,
  Loader2,
  Plus,
  Printer,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MdTableBar } from 'react-icons/md'
import { useServerAction } from 'zsa-react'
import { readCashSession } from '../../cash-register/actions'
import { printTableReceipt } from '../../config/printing/actions'

export function Tables({ tables }: { tables: TableType[] | null }) {
  const [search, setSearch] = useState('')

  const { setIsCashOpen, isCashOpen } = useCashRegister()

  const { execute, data, isPending } = useServerAction(readCashSession, {
    onSuccess: () => {
      const isOpen = !!data?.cashSession

      setIsCashOpen(isOpen)
    },
  })

  const { execute: executePrint } = useServerAction(printTableReceipt)

  async function handleReadCashSession() {
    await execute()
  }

  useEffect(() => {
    if (!data) {
      handleReadCashSession()
    }
  }, [tables])

  return (
    <section className="flex flex-col gap-4 text-sm">
      <header className="flex flex-col lg:flex-row gap-4">
        <Link
          href="purchases/tables/register"
          className={cn(buttonVariants(), 'w-full max-w-sm')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Abrir mesa
        </Link>

        <div className="relative w-full">
          <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Buscar mesa..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-4 lg:grid-cols-10 gap-4">
        {tables &&
          tables.length > 0 &&
          tables.map((table) => {
            const purchaseItems = table.purchase_items
            const totalAmount = table.purchase_items.reduce(
              (sum, item) => sum + item.product_price,
              0,
            )

            return (
              <Sheet key={table.id}>
                <SheetTrigger>
                  <Card className="flex flex-col items-center justify-center aspect-square p-2">
                    <strong className="text-xl">{table.number}</strong>

                    {table.description && (
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {table.description}
                      </span>
                    )}
                  </Card>
                </SheetTrigger>
                <SheetContent className="px-0">
                  <ScrollArea className="h-dvh pb-16 px-6">
                    <SheetHeader className="flex flex-row items-center">
                      <SheetClose>
                        <ArrowLeft className="mr-4" />
                      </SheetClose>

                      <div className="flex flex-col">
                        <SheetTitle className="!mt-0">
                          Mesa #{table.number}
                        </SheetTitle>
                        {table.description && (
                          <SheetDescription>
                            {table.description}
                          </SheetDescription>
                        )}
                      </div>
                      <Link
                        href={`purchases/tables/register?id=${table.id}&edit=true`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'ml-auto',
                        )}
                      >
                        <Edit />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          executePrint({
                            tableId: table.id,
                            reprint: true,
                          })
                        }
                      >
                        <Printer />
                      </Button>
                    </SheetHeader>

                    <section className="py-4 w-full flex flex-col gap-4">
                      <div className="flex flex-row items-center justify-between">
                        <p>Total da mesa:</p>
                        <span>{formatCurrencyBRL(totalAmount)}</span>{' '}
                      </div>

                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Link
                              href={
                                isCashOpen
                                  ? `purchases/close?table_id=${table.id}&tab=tables`
                                  : '/admin/cash-register'
                              }
                              className={cn(
                                buttonVariants(),
                                isPending && 'opacity-50 cursor-not-allowed',
                              )}
                            >
                              {isPending ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>Carregando...</span>
                                </>
                              ) : (
                                <>
                                  <BadgeDollarSign className="w-5 h-5" />
                                  <span>Fechar mesa</span>
                                </>
                              )}
                            </Link>
                          </TooltipTrigger>

                          {!isCashOpen && (
                            <TooltipContent>
                              <div>
                                <strong>Fechar venda</strong>
                                <p>
                                  Para fechar a venda, é necessário abrir o
                                  caixa.
                                </p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </section>

                    <section className="flex flex-col gap-2 relative h-full">
                      <h1 className="text-lg font-bold mb-2">Itens da mesa</h1>

                      <div className="flex flex-col gap-2">
                        <Link
                          href={`purchases/tables/register?id=${table.id}`}
                          className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'w-full max-w-sm',
                          )}
                        >
                          <span className="flex flex-row items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar produtos
                          </span>
                        </Link>
                        {purchaseItems &&
                          purchaseItems.length > 0 &&
                          purchaseItems.map((item) => {
                            // Calculando o total do item (produto base)
                            const itemTotal = item.product_price

                            // Calculando o total dos extras
                            const extrasTotal = item.extras.reduce(
                              (acc, extra) => {
                                return acc + extra.price * extra.quantity
                              },
                              0,
                            )

                            // Somando o total do item com o total dos extras
                            const total =
                              (itemTotal + extrasTotal) * item.quantity

                            return (
                              <Card key={item.id} className="p-4 space-y-2">
                                <header className="flex flex-row items-start justify-between gap-4 text-sm">
                                  <strong className="line-clamp-2 uppercase">
                                    {item.quantity} {item?.products?.name}
                                  </strong>
                                  <span>
                                    {formatCurrencyBRL(
                                      item?.products?.price ?? 0,
                                    )}
                                  </span>
                                </header>

                                {item.extras.length > 0 &&
                                  item.extras.map((extra) => (
                                    <p
                                      key={extra.id}
                                      className="flex flex-row items-center justify-between w-full text-muted-foreground"
                                    >
                                      <span className="flex flex-row items-center">
                                        <Plus className="w-3 h-3 mr-1" />{' '}
                                        {extra.quantity} ad. {extra.name}
                                      </span>
                                      <span>
                                        {formatCurrencyBRL(
                                          extra.price * extra.quantity,
                                        )}
                                      </span>
                                    </p>
                                  ))}

                                <div className="flex flex-col">
                                  {item.observations &&
                                    item.observations.length > 0 &&
                                    item.observations.map((obs) => (
                                      <span className="flex flex-row items-center text-muted-foreground uppercase">
                                        <Asterisk className="w-3 h-3 mr-1" />
                                        {obs}
                                      </span>
                                    ))}
                                </div>

                                <footer className="flex flex-row items-center justify-between">
                                  <p>Total:</p>
                                  <span>{formatCurrencyBRL(total)}</span>{' '}
                                </footer>
                              </Card>
                            )
                          })}
                      </div>
                    </section>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )
          })}
      </div>

      {!tables ||
        (tables.length === 0 && (
          <div className="flex flex-col gap-4 items-center justify-center text-muted-foreground">
            <MdTableBar className="w-32 h-32 opacity-30" />
            <p>Nenhuma mesa aberta.</p>
          </div>
        ))}
    </section>
  )
}
