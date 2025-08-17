'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ProductImage } from '@/features/store/initial-data/schemas'
import Image from 'next/image'

export function ProductImages({ images }: { images: ProductImage[] }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-0 h-[45dvh] overflow-hidden">
      {images.length < 2 && (
        <div className="relative w-full h-full border-none">
          <Image
            src={images[0]?.image_url ?? '/default_thumb_url.png'}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}

      {images.length >= 2 && (
        <Carousel>
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id} className="pl-0">
                <div className="relative w-full aspect-square overflow-hidden border-none">
                  <Image
                    src={image.image_url as string}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  )
}
