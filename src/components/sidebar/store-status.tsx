import { SwitchStoreStatus } from '@/app/switch-store-status'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { StoreType } from '@/models/store'
import { CheckCircle2, ChevronsUpDown, Clock } from 'lucide-react'
import { Card } from '../ui/card'

export async function StoreStatus({ store }: { store: StoreType }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Card
          className="flex flex-row items-center bg-secondary hover:bg-secondary/75 p-2 text-xs
            text-left px-4"
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
