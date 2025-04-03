import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { ListFilter } from 'lucide-react'
import { SearchIsland } from './search-island'
import { SearchSheet } from './search-sheet'

export default function SearchLoading() {
  return (
    <SearchIsland>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-0">
          <div className="flex flex-row items-center gap-3 w-full">
            <SearchSheet subdomain="" />
            <AccordionTrigger className="[&>svg]:hidden py-0">
              <span className="flex p-2 bg-primary text-primary-foreground rounded-md">
                <ListFilter className="block w-4 h-4" />
              </span>
            </AccordionTrigger>
          </div>

          <AccordionContent className="flex flex-row flex-wrap gap-2 mt-4 pb-0">
            <Skeleton className="w-32 h-[1.375rem]" />
            <Skeleton className="w-32 h-[1.375rem]" />
            <Skeleton className="w-32 h-[1.375rem]" />
            <Skeleton className="w-32 h-[1.375rem]" />
            <Skeleton className="w-32 h-[1.375rem]" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </SearchIsland>
  )
}
