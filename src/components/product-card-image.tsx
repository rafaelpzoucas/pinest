import Image from "next/image";
import defaultThumbUrl from "@/../public/default_thumb_url.png";
import { Card } from "./ui/card";
import { ProductImageType } from "@/models/product";

export function ProductCardImage({
  productImages,
}: {
  productImages: ProductImageType[];
}) {
  function getImageURL() {
    if (productImages.length > 0) {
      return productImages[0].image_url;
    }

    return defaultThumbUrl;
  }

  const imageURL = getImageURL();

  return (
    <Card className="relative min-w-14 w-full lg:max-w-10 aspect-square overflow-hidden border-0">
      <Image
        src={imageURL ?? "/default_thumb_url.png"}
        fill
        alt=""
        className="object-cover"
      />
    </Card>
  );
}
