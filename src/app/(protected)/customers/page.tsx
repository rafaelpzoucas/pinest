import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { CustomerCard } from './customer-card'
import { Button } from '@/components/ui/button'

export default function CustomersPage() {
  return (
    <main className="space-y-6 p-4">
      <h1 className="text-lg text-center font-bold">Clientes</h1>

      <section className="flex flex-col gap-2">
        <Button variant={'outline'}>
          <Plus className="w-4 h-4 mr-2" /> Novo cliente
        </Button>
        <Link href="/customers/id_do_cliente">
          <CustomerCard />
        </Link>
        <Link href="/customers/id_do_cliente">
          <CustomerCard />
        </Link>
      </section>
    </main>
  )
}
