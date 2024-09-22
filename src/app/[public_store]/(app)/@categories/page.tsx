import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { Box } from 'lucide-react'
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
    <>
      <div className="lg:hidden w-full">
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
        <Card className="sticky top-4 flex flex-col gap-2 w-full p-4 bg-secondary/50 border-0 h-fit">
          {categories &&
            categories.map((category) => (
              <Link
                key={category.id}
                href={`#${category.name.toLowerCase()}`}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start',
                )}
              >
                {category.name}
              </Link>
            ))}
        </Card>
      </div>
    </>
  )
}
