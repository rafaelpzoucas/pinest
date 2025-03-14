import { AdminHeader } from '@/app/admin-header'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Categories } from './categories'
import { Extras } from './extras'

export default function CatalogPage({
  searchParams,
}: {
  searchParams: { tab: string }
}) {
  return (
    <div className="space-y-4 p-4 lg:px-0">
      <AdminHeader title="Catálogo" />

      <Tabs defaultValue={searchParams.tab ?? 'products'}>
        <TabsList>
          <TabsTrigger value="products" asChild>
            <Link href="?tab=products">Produtos</Link>
          </TabsTrigger>
          <TabsTrigger value="extras" asChild>
            <Link href="?tab=extras">Adicionais</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex flex-col gap-6">
            <Link
              href="catalog/categories/register"
              className={cn(buttonVariants(), 'max-w-md')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar categoria
            </Link>
            <section>
              <Categories />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="extras">
          <div className="flex flex-col gap-6">
            <Link
              href="catalog/extras/register"
              className={cn(buttonVariants(), 'max-w-md')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar adicional
            </Link>
            <section>
              <Extras />
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
