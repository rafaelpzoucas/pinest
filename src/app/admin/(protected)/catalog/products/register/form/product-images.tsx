import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { ProductImageType } from '@/models/product'
import { Trash } from 'lucide-react'
import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'
import { FileType, FileUploader } from './file-uploader'

type ProductImagesProps = {
  files: FileType[]
  setFiles: Dispatch<SetStateAction<FileType[]>>
  productImages: ProductImageType[]
  handleDeleteImage: (imageId: string) => void
}

export function ProductImages({
  files,
  setFiles,
  productImages,
  handleDeleteImage,
}: ProductImagesProps) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <CardTitle>Fotos do produto</CardTitle>

      <FileUploader files={files} setFiles={setFiles} />

      {productImages.length > 0 && (
        <section className="grid grid-cols-4 gap-2">
          {productImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden"
            >
              <Image
                src={image.image_url}
                alt=""
                fill
                className="object-cover"
              />

              <Button
                type="button"
                variant={'outline'}
                size="icon"
                className="absolute top-1 right-1 w-8 h-8"
                onClick={() => handleDeleteImage(image.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </section>
      )}
    </Card>
  )
}
