'use client'

import { buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn, stringToNumber } from '@/lib/utils'
import { PurchaseItemsType } from '@/models/purchase'
import { useCloseBillStore } from '@/stores/closeBillStore'
import { Divide } from 'lucide-react'
import { useState } from 'react'

export function SplitTitem({ item }: { item: PurchaseItemsType }) {
  const { splitItem } = useCloseBillStore()

  const [split, setSplit] = useState('')

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'ml-auto',
        )}
      >
        <Divide className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dividir em quantas pessoas?</DialogTitle>

          <Input
            value={split}
            onChange={(e) => setSplit(e.target.value)}
            placeholder="Insira a quantidade de pessoas..."
          />

          <DialogClose
            onClick={() => splitItem(item, stringToNumber(split))}
            className={buttonVariants()}
          >
            Dividir item
          </DialogClose>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
