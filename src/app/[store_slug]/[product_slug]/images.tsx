"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { ProductImage } from "@/features/store/initial-data/schemas";

export function ProductImages({ images }: { images: ProductImage[] }) {
  const hasImages = images && images.length > 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-0 h-[45vh] overflow-hidden">
      {!hasImages && (
        <div className="relative w-full max-w-xl h-full mx-auto border-none">
          <Image
            src="/default_thumb_url.png"
            alt="Imagem padrão do produto"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iaHNsKDI0MCAzLjclIDE1LjklKSIvPgo8L3N2Zz4K"
          />
        </div>
      )}

      {hasImages && images.length < 2 && (
        <div className="relative w-full h-full border-none">
          <Image
            src={images[0].image_url || "/default_thumb_url.png"}
            alt="Imagem do produto"
            fill
            priority // CRÍTICO para LCP - primeira imagem
            className="object-cover"
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iaHNsKDI0MCAzLjclIDE1LjklKSIvPgo8L3N2Zz4K"
          />
        </div>
      )}

      {hasImages && images.length >= 2 && (
        <Carousel>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id} className="pl-0">
                <div className="relative w-full aspect-square overflow-hidden border-none">
                  <Image
                    src={image.image_url || "/default_thumb_url.png"}
                    alt={`Imagem do produto ${index + 1}`}
                    fill
                    priority={index === 0} // Apenas primeira imagem com priority
                    className="object-cover"
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iaHNsKDI0MCAzLjclIDE1LjklKSIvPgo8L3N2Zz4K"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Preload próximas imagens do carousel */}
          {images.slice(1, 3).map((image) => (
            <link
              key={`preload-${image.id}`}
              rel="preload"
              as="image"
              href={image.image_url || "/default_thumb_url.png"}
            />
          ))}
        </Carousel>
      )}
    </div>
  );
}
