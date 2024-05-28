import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ListFilter } from 'lucide-react'

export function Search() {
  const categories = [
    {
      name: 'Lanches',
      link: '#Lanches',
    },
    {
      name: 'Sobremesas',
      link: '#Sobremesas',
    },
    {
      name: 'Bebidas',
      link: '#Bebidas',
    },
  ]

  return (
    <section className="sticky top-0 z-20 flex flex-col bg-background p-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-0">
          <div className="flex flex-row items-center gap-3 w-full">
            <Input placeholder="Buscar na loja por..." />
            <AccordionTrigger className="[&>svg]:hidden py-0">
              <span className="flex p-2 bg-primary text-primary-foreground rounded-md">
                <ListFilter className="block w-4 h-4" />
              </span>
            </AccordionTrigger>
          </div>

          <AccordionContent className="flex flex-row flex-wrap gap-2 mt-4 pb-0">
            {categories.map((category) => (
              <a href={category.link} key={category.link}>
                <Badge>{category.name}</Badge>
              </a>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
