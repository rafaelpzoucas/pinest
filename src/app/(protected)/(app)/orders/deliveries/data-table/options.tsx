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
import { OrderType } from '@/models/order'
import { MoreVertical } from 'lucide-react'
import { CancelOrderButton } from './cancel-order-button'
import { CloseSaleButton } from './close-sale-button'
import { EditButton } from './edit-button'
import { Printbutton } from './print-button'
import { UpdateStatusButton } from './update-status-button'

export function OrderOptions({ order }: { order: OrderType }) {
  const currentStatus = order?.status

  const accepted = currentStatus !== 'accept'

  const options = [
    {
      name: 'edit',
      component: <EditButton order={order} />,
      title: 'Editar pedido',
    },
    {
      name: 'print',
      component: <Printbutton order={order} />,
      title: 'Imprimir',
    },
  ]

  return (
    <>
      <div className="flex flex-row justify-end w-full gap-1">
        <UpdateStatusButton order={order} />

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                <CancelOrderButton order={order} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancelar pedido</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <CloseSaleButton order={order} />

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
