import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { Orders } from './orders'

export default function WorkspacePage() {
  return (
    <main className="space-y-6 p-4">
      <h1 className="text-lg text-center font-bold">Pedidos</h1>

      <Button className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Nova venda
      </Button>

      <div className="relative">
        <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar pedido..." className="pl-10" />
      </div>

      <Orders />
    </main>
  )
}
