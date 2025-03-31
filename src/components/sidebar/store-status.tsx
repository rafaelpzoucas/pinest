'use client'

import { SwitchStoreStatus } from '@/app/switch-store-status'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StoreType } from '@/models/store'
import { CheckCircle2, ChevronsUpDown, Clock } from 'lucide-react'
import { Card } from '../ui/card'
import { useSidebar } from '../ui/sidebar'

export function StoreStatus({ store }: { store: StoreType }) {
  const { state } = useSidebar()

  const isCollapsed = state === 'collapsed'

  return (
    <Popover>
      <PopoverTrigger>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                className="flex items-center justify-center w-8 h-8 data-[collapsed=false]:hidden"
                data-collapsed={isCollapsed}
              >
                {store.is_open ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                {store.is_open ? (
                  <>
                    <strong className="flex flex-row items-center text-sm text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Loja aberta
                    </strong>
                    <p className="text-primary-foreground">
                      Dentro do horário programado
                    </p>
                  </>
                ) : (
                  <>
                    <strong className="flex flex-row items-center text-sm text-amber-600">
                      <Clock className="w-4 h-4 mr-2" /> Loja fechada
                    </strong>
                    <p className="text-primary-foreground">
                      Dentro do horário programado
                    </p>
                  </>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Card
          className="flex flex-row items-center bg-secondary hover:bg-secondary/75 p-2 text-xs
            text-left px-4 data-[collapsed=true]:hidden"
          data-collapsed={isCollapsed}
        >
          <div>
            {store.is_open ? (
              <>
                <strong className="flex flex-row items-center text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Loja aberta
                </strong>
                <p className="text-muted-foreground">
                  Dentro do horário programado
                </p>
              </>
            ) : (
              <>
                <strong className="flex flex-row items-center text-sm text-amber-600">
                  <Clock className="w-4 h-4 mr-2" /> Loja fechada
                </strong>
                <p className="text-muted-foreground">
                  Dentro do horário programado
                </p>
              </>
            )}
          </div>

          <ChevronsUpDown className="w-4 h-4 ml-auto" />
        </Card>
      </PopoverTrigger>
      <PopoverContent align="start">
        <SwitchStoreStatus isOpen={store.is_open} storeId={store.id} />
      </PopoverContent>
    </Popover>
  )
}
