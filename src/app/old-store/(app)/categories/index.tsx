'use client'

import { readCategoriesData } from '@/actions/client/app/public_store/categories'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePublicStore } from '@/stores/public-store'
import { useQuery } from '@tanstack/react-query'
import { Box } from 'lucide-react'
import Link from 'next/link'
import CategoriesLoading from './loading'

export function Categories() {
  const { store } = usePublicStore()
  const isMobile = useIsMobile()

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
    <div className="w-full max-w-7xl lg:pt-8">
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
                <CarouselItem
                  className="flex-[0_0_27.5%] lg:flex-[0_0_8.6%]"
                  key={category.id}
                >
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
        <div className="hidden lg:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  )
}
