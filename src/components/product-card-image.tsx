import { ProductImage } from '@/features/store/initial-data/schemas'
import Image from 'next/image'
import { Card } from './ui/card'

export function ProductCardImage({
  productImages,
}: {
  productImages: ProductImage[]
}) {
  function getImageURL() {
    if (productImages.length > 0) {
      return productImages[0].image_url
    }

    return ''
  }

  const imageURL = getImageURL()

  return (
    <Card className="relative min-w-14 w-full lg:max-w-10 aspect-square overflow-hidden border-0">
      <Image
        src={imageURL ?? '/default_thumb_url.png'}
        fill
        alt=""
        className="object-cover"
      />
    </Card>
  )
}
