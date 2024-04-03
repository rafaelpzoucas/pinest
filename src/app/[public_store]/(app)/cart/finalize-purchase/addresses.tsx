import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, MoreVertical, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const addresses = [
  {
    id: '1',
    name: 'Casa',
    street: 'Rua Castro Alves',
    number: '1',
    cep: '19800-320',
    neighborhood: 'Centro',
    city: 'Assis',
    state: 'São Paulo',
  },
]

export function Addresses() {
  const searchParams = useSearchParams()
  const selectedAddress = searchParams.get('address')
  const selectedPayment = searchParams.get('payment')

  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="grid grid-cols-[1fr_5fr_1fr] items-center w-full py-2">
        <Link href="?step=pickup" className="flex flex-row items-center p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-center text-lg font-bold w-full">
          Escolha o endereço
        </h1>
      </header>

      <div className="flex flex-col gap-2 w-full">
        {addresses.map((address) => (
          <Link
            href={`?step=address&pickup=delivery&address=${address.id}`}
            key={address.id}
          >
            <Card
              className={cn(
                'relative flex flex-col justify-between p-4 w-full',
                selectedAddress === address.id &&
                  'bg-primary text-primary-foreground',
              )}
            >
              <header className="flex flex-row items-start justify-between w-full">
                <strong className="max-w-[250px] line-clamp-2 text-sm">
                  {address.street}, {address.number}
                </strong>

                <div className="absolute top-2 right-1 flex flex-row items-center">
                  {selectedAddress === address.id && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={'ghost'} size={'icon'}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <p
                className={cn(
                  'mt-2 text-xs text-muted-foreground line-clamp-2',
                  selectedAddress === address.id && 'text-muted',
                )}
              >
                {address.cep} - {address.neighborhood} - {address.city},{' '}
                {address.state}
              </p>
            </Card>
          </Link>
        ))}

        <Link
          href={`?step=new-address${selectedPayment ? '&payment=' + selectedPayment : ''}`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Endereço
        </Link>
      </div>

      <Link
        href={
          selectedAddress
            ? `?step=${selectedPayment ? 'confirm' : 'payment'}&pickup=delivery&address=${selectedAddress}${selectedPayment ? '&payment=' + selectedPayment : ''}`
            : ''
        }
      >
        <Button className="w-full" disabled={!selectedAddress}>
          Continuar
        </Button>
      </Link>
    </section>
  )
}
