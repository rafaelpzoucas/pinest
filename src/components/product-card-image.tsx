import defaultThumbUrl from '@/../public/default_thumb_url.png'
import { ProductImageType } from '@/models/product'
import Image from 'next/image'
import { Card } from './ui/card'

export function ProductCardImage({
  productImages,
}: {
  productImages: ProductImageType[]
}) {
  function getImageURL() {
    if (productImages.length > 0) {
      return productImages[0].image_url
    }

    return ''
  }

  const imageURL = getImageURL()

  const thumbURL = imageURL === '' ? defaultThumbUrl : imageURL

  return (
    <Card className="relative min-w-14 w-full lg:max-w-10 aspect-square overflow-hidden border-0">
      <Image src={thumbURL} fill alt="" className="object-cover" />
    </Card>
  )
}
