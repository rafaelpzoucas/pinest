import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function ShippingStep() {
  return (
    <div>
      <form className="flex flex-row gap-2 w-full">
        <Link
          href="/admin/dashboard"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Pular
        </Link>
        <Button type="submit" className="w-full">
          Configurar envios
        </Button>
      </form>
    </div>
  )
}
