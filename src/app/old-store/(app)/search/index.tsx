import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SlidersHorizontal } from 'lucide-react'
import { readStoreCached } from '../../actions'
import { SearchIsland } from './search-island'
import { SearchSheet } from './search-sheet'

export default async function Search() {
  const [data] = await readStoreCached()
  const store = data?.store

  return (
    <SearchIsland>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-0">
          <div className="flex flex-row items-center gap-3 w-full">
            <SearchSheet subdomain={store?.store_subdomain} />
            <AccordionTrigger className="[&>svg]:hidden py-0">
              <span className="flex p-2 bg-primary text-primary-foreground rounded-md">
                <SlidersHorizontal className="block w-4 h-4" />
              </span>
            </AccordionTrigger>
          </div>
        </AccordionItem>
      </Accordion>
    </SearchIsland>
  )
}
