'use client'

import { buttonVariants } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Category } from '@/features/store/initial-data/schemas'
import Link from 'next/link'

export function Categories({ categories }: { categories: Category[] }) {
  if (!categories) {
    return null
  }

  const activeCategories = categories.filter((c) => c.status === 'active')

  return (
    <div
      className="w-full max-w-7xl lg:pt-8 sticky -top-[1px] z-20 bg-background px-4 py-4
        select-none"
    >
      <Carousel
        opts={{
          dragFree: true,
          align: 'start', // Alinha os itens no início
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {categories &&
            activeCategories.map((category) => (
              <CarouselItem
                className="basis-auto pl-4 md:pl-6" // basis-auto permite tamanho dinâmico
                key={category.id}
              >
                <Link
                  href={`#${category.name.toLowerCase()}`}
                  className={buttonVariants({
                    variant: 'secondary',
                    className:
                      'px-4 !py-5 hover:bg-primary !hover:text-primary-foreground',
                  })}
                >
                  <span className="text-center whitespace-nowrap">
                    {category.name}
                  </span>
                </Link>
              </CarouselItem>
            ))}
        </CarouselContent>
        <div className="hidden lg:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  )
}
