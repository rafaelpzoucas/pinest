'use client'

import { readCategoriesData } from '@/actions/client/app/public_store/categories'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { usePublicStore } from '@/stores/public-store'
import { useQuery } from '@tanstack/react-query'
import { Box } from 'lucide-react'
import Link from 'next/link'
import CategoriesLoading from './loading'

export function Categories() {
  const { store } = usePublicStore()

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => readCategoriesData(store?.id),
    enabled: !!store,
  })

  const categories = data?.categories

  if (!store || isLoading) {
    return <CategoriesLoading />
  }

  return (
    <>
      <div className="lg:hidden w-full max-w-7xl">
        <Carousel
          opts={{
            dragFree: true,
          }}
        >
          <CarouselContent>
            {categories &&
              categories.map((category) => {
                if (category?.products.length === 0) return null

                return (
                  <CarouselItem className="flex-[0_0_27.5%]" key={category.id}>
                    <Link
                      href={`#${category.name.toLowerCase()}`}
                      className="flex flex-col items-center justify-center gap-2"
                    >
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={category.image_url} />
                        <AvatarFallback>
                          <Box />
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-center">{category.name}</p>
                    </Link>
                  </CarouselItem>
                )
              })}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="hidden lg:flex w-full">
        <Card className="sticky top-4 flex flex-col gap-4 w-full p-4 bg-secondary/50 border-0 h-fit">
          <div className="flex flex-row justify-around">
            {categories &&
              categories.map((category) => {
                if (category?.products.length === 0) return null

                return (
                  <Link
                    key={category.id}
                    href={`#${category.name.toLowerCase()}`}
                    className={buttonVariants({ variant: 'ghost' })}
                  >
                    {category.name}
                  </Link>
                )
              })}
          </div>
        </Card>
      </div>
    </>
  )
}
