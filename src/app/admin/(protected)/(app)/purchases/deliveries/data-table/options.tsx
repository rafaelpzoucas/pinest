'use client'

import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { MoreVertical } from 'lucide-react'
import { CancelPurchaseButton } from './cancel-purchase-button'
import { CloseSaleButton } from './close-sale-button'
import { EditButton } from './edit-button'
import { Printbutton } from './print-button'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({ purchase }: { purchase: PurchaseType }) {
  const currentStatus = purchase?.status

  const accepted = currentStatus !== 'accept'

  const options = [
    {
      name: 'edit',
      component: <EditButton purchase={purchase} />,
      title: 'Editar pedido',
    },
    {
      name: 'print',
      component: <Printbutton purchase={purchase} />,
      title: 'Imprimir',
    },
  ]

  return (
    <>
      <div className="flex flex-row justify-end w-full gap-1">
        <UpdateStatusButton purchase={purchase} />

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                <CancelPurchaseButton purchase={purchase} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancelar pedido</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                <CloseSaleButton purchase={purchase} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fechar venda</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="hidden lg:flex flex-row justify-end">
          <TooltipProvider>
            {options.map((option, index) => (
              <Tooltip delayDuration={0} key={index}>
                <TooltipTrigger asChild>
                  <div>{option.component}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{option.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              !accepted && 'hidden',
              'lg:hidden',
            )}
          >
            <MoreVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {options.map((option, index) => (
              <DropdownMenuItem key={index} className="">
                {option.component}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
