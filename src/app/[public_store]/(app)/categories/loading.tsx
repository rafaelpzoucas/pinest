import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function HeaderLoading() {
  return (
    <>
      <div className="lg:hidden w-full">
        <Carousel
          opts={{
            dragFree: true,
          }}
        >
          <CarouselContent>
            <CarouselItem className="flex-[0_0_27.5%]">
              <div className="flex flex-col items-center justify-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="w-full h-3" />
              </div>
            </CarouselItem>
            <CarouselItem className="flex-[0_0_27.5%]">
              <div className="flex flex-col items-center justify-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="w-full h-3" />
              </div>
            </CarouselItem>
            <CarouselItem className="flex-[0_0_27.5%]">
              <div className="flex flex-col items-center justify-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="w-full h-3" />
              </div>
            </CarouselItem>
            <CarouselItem className="flex-[0_0_27.5%]">
              <div className="flex flex-col items-center justify-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="w-full h-3" />
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      <div className="hidden lg:flex w-full">
        <Card className="sticky top-4 flex flex-col gap-2 w-full p-4 bg-secondary/50 border-0 h-fit">
          <div
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'justify-start',
            )}
          >
            <Skeleton className="w-3/4 h-4" />
          </div>
          <div
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'justify-start',
            )}
          >
            <Skeleton className="w-4/5 h-4" />
          </div>
          <div
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'justify-start',
            )}
          >
            <Skeleton className="w-3/5 h-4" />
          </div>
          <div
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'justify-start',
            )}
          >
            <Skeleton className="w-3/4 h-4" />
          </div>
        </Card>
      </div>
    </>
  )
}
