import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { CreatePurchaseForm } from './form'

export function CreatePurchaseSheet() {
  return (
    <Sheet>
      <SheetTrigger className={cn(buttonVariants(), 'max-w-sm')}>
        <Plus className="w-4 h-4 mr-2" />
        Criar pedido
      </SheetTrigger>

      <SheetContent className="space-y-6">
        <SheetHeader>
          <SheetTitle>Novo pedido</SheetTitle>
        </SheetHeader>

        <CreatePurchaseForm />
      </SheetContent>
    </Sheet>
  )
}
