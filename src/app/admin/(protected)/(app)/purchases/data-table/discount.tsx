import { Button } from '@/components/ui/button'
import {
  Sheet,
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
import { BadgeDollarSign } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DiscountForm } from './discount-form'

export function Discount({
  purchaseId,
  discount,
}: {
  purchaseId: string
  discount: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const qDiscount = searchParams.get('discount')

  function handleOpen(state: boolean) {
    if (state && discount) {
      router.push(`?discount=${discount}`)
    } else {
      if (qDiscount) {
        router.back()
      }
    }
  }

  return (
    <Sheet onOpenChange={handleOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <SheetTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <BadgeDollarSign className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
          </SheetTrigger>
          <TooltipContent>
            <p>Desconto</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Desconto</SheetTitle>
          <SheetDescription>
            Digite o valor que deseja descontar do total do pedido
          </SheetDescription>
        </SheetHeader>

        <DiscountForm purchaseId={purchaseId} />
      </SheetContent>
    </Sheet>
  )
}
