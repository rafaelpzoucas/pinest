import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { readCategoriesByStoreURL } from '../@search/actions'

export default async function Header({
  params,
}: {
  params: { public_store: string }
}) {
  const { data: categories, error: categoriesError } =
    await readCategoriesByStoreURL(params.public_store)

  if (categoriesError) {
    console.error(categoriesError)
  }

  return (
    <Card className="sticky top-4 flex flex-col gap-2 w-full p-4 bg-secondary/50 border-0 h-fit">
      {categories &&
        categories.map((category) => (
          <Link
            key={category.id}
            href={`#${category.name.toLowerCase()}`}
            className="inline-flex h-9 w-full items-start justify-start rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          >
            {category.name}
          </Link>
        ))}
    </Card>
  )
}
