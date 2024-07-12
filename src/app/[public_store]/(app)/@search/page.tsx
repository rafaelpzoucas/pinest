import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'
import { readCategoriesByStoreURL } from './actions'
import { SearchIsland } from './search-island'
import { SearchSheet } from './search-sheet'

export default async function Search({
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
    <SearchIsland>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-0">
          <div className="flex flex-row items-center gap-3 w-full">
            <SearchSheet publicStore={params.public_store} />
            <AccordionTrigger className="[&>svg]:hidden py-0">
              <span className="flex p-2 bg-primary text-primary-foreground rounded-md">
                <SlidersHorizontal className="block w-4 h-4" />
              </span>
            </AccordionTrigger>
          </div>

          <AccordionContent className="flex flex-row flex-wrap gap-2 mt-4 pb-0">
            {categories &&
              categories.map((category) => (
                <a href={`#${category.name.toLowerCase()}`} key={category.id}>
                  <Badge>{category.name}</Badge>
                </a>
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </SearchIsland>
  )
}
