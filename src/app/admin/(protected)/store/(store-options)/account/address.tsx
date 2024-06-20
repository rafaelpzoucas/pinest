import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, queryParamsLink } from '@/lib/utils'
import { AddressType } from '@/models/user'
import { Edit } from 'lucide-react'
import Link from 'next/link'

export function Address({ address }: { address: AddressType | null }) {
  const street = `${address?.street}, ${address?.number}`
  const city = `${address?.city}/${address?.state}`
  const zipCode = address?.zip_code

  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <h1 className="font-bold">Endereço</h1>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <span className="text-muted-foreground text-xs">Logradouro</span>
          <p className="text-sm">{street}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Cidade</span>
          <p className="text-sm">{city}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">CEP</span>
          <p className="text-sm">{zipCode}</p>
        </div>
      </div>

      <Link
        href={`account/register/address?${queryParamsLink(address)}`}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute top-2 right-2',
        )}
      >
        <Edit className="w-4 h-4" />
      </Link>
    </Card>
  )
}
