import { Timer } from 'lucide-react'

export function HeaderDeliveryInfo() {
  return (
    <div className="flex flex-row gap-2 mt-6">
      <div className="flex flex-row items-center gap-1 text-xs">
        <Timer className="w-4 h-4 text-muted-foreground" />
        <span className="flex flex-row items-center gap-2">
          <span className="text-muted-foreground">Entrega:</span>
          <strong>
            35min <span className="text-muted-foreground">&bull;</span> R$ 6,00
          </strong>
        </span>
      </div>
      <span className="w-[1px] h-4 bg-muted-foreground/10"></span>
      <div className="flex flex-row items-center gap-1 text-xs">
        <Timer className="w-4 h-4 text-muted-foreground" />
        <span className="flex flex-row items-center gap-2">
          <span className="text-muted-foreground">Retirada:</span>
          <strong>5min</strong>
        </span>
      </div>
    </div>
  )
}
