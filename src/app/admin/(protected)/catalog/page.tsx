import { Header } from '@/components/header'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Categories } from './categories'
import { Products } from './products'

export default function CatalogPage({
  searchParams,
}: {
  searchParams: { tab: string }
}) {
  return (
    <div className="p-5">
      <Tabs defaultValue={searchParams.tab ?? 'products'}>
        <Header title="Catálogo" />

        <TabsList>
          <TabsTrigger value="products" asChild>
            <Link href="?tab=products">Produtos</Link>
          </TabsTrigger>
          <TabsTrigger value="categories" asChild>
            <Link href="?tab=categories">Categorias</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex flex-col gap-6">
            <Link href="catalog/products/register" className={buttonVariants()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar produto
            </Link>
            <section>
              <Products />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="categories">
          <div className="flex flex-col gap-6">
            <Link
              href="catalog/categories/register"
              className={buttonVariants()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar categoria
            </Link>
            <section>
              <Categories />
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
