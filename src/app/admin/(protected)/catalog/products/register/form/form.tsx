'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { ProductImageType, ProductType } from '@/models/product'
import { Loader, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CategoryType } from '../../../categories/actions'
import { createProduct, deleteProductImage, updateProduct } from '../actions'
import { readProductImages, uploadImages } from '../client-actions'
import { updateProductVariations } from './actions'
import { Dimensions } from './dimensions'
import { FileType } from './file-uploader'
import { ProductImages } from './product-images'
import { ProductInfo } from './product-info'

export type VariationsFormType = {
  id: string
  price: string
  stock: string
}

export const newProductFormSchema = z.object({
  category_id: z.string().min(1),
  name: z.string().min(2, { message: 'O nome do produto é obrigatório.' }),
  description: z.string().min(1, { message: 'Escreva uma descrição.' }),
  price: z.string().optional(),
  promotional_price: z.string().optional(),
  stock: z.string().optional(),
  sku: z.string().optional(),
  pkg_weight: z.string().optional(),
  pkg_length: z.string().optional(),
  pkg_width: z.string().optional(),
  pkg_height: z.string().optional(),
})

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryType[] | null
  product: ProductType | null
}) {
  const router = useRouter()
  const pathname = usePathname()

  const defaultVariations =
    product &&
    product.product_variations.map((variation) => ({
      id: variation.id,
      price: variation.price ?? '',
      stock: variation.stock ?? '',
    }))

  const [files, setFiles] = useState<FileType[]>([])
  const [productImages, setProductImages] = useState<ProductImageType[]>([])
  const [variationsForm, setVariationsForm] = useState<
    VariationsFormType[] | null
  >(defaultVariations)

  const pathnameParts = pathname.split('/')
  pathnameParts.pop()
  pathnameParts.pop()
  const redirectTo = pathnameParts.join('/')

  const productId = product?.id

  const form = useForm<z.infer<typeof newProductFormSchema>>({
    resolver: zodResolver(newProductFormSchema),
    defaultValues: {
      name: product?.name ?? undefined,
      description: product?.description ?? undefined,
      price: product?.price?.toString() ?? undefined,
      promotional_price: product?.promotional_price?.toString() ?? undefined,
      stock: product?.stock?.toString() ?? undefined,
      category_id: product?.category_id ?? undefined,
      sku: product?.sku ?? undefined,
      pkg_weight: product?.pkg_weight?.toString() ?? undefined,
      pkg_length: product?.pkg_length?.toString() ?? undefined,
      pkg_width: product?.pkg_width?.toString() ?? undefined,
      pkg_height: product?.pkg_height?.toString() ?? undefined,
    },
  })

  const formState = form.formState

  async function handleReadProductImages() {
    if (productId) {
      const { productImages, productImagesError } =
        await readProductImages(productId)

      if (productImagesError) {
        console.error(productImagesError)
      }

      setProductImages(productImages)
    }
  }

  async function handleDeleteImage(imageId: string) {
    const { tableError, storageError } = await deleteProductImage(imageId)

    if (tableError) {
      console.error(tableError)
      return null
    }

    if (storageError) {
      console.error(storageError)
      return null
    }

    handleReadProductImages()
  }

  async function onSubmit(values: z.infer<typeof newProductFormSchema>) {
    if (!productId) {
      const { createdProduct, createdProductError } =
        await createProduct(values)

      if (createdProductError) {
        console.error(createdProductError)
        return
      }

      if (createdProduct) {
        if (files.length > 0) {
          const { uploadErrors } = await uploadImages(
            files,
            createdProduct[0].id,
          )

          if (uploadErrors) {
            console.error(uploadErrors)
          }
        }
      }

      return router.push(`${redirectTo}?tab=products`)
    }

    const { error } = await updateProduct(productId, values)

    if (error) {
      console.error(error)
      return null
    }

    if (files.length > 0 && productId) {
      const { uploadErrors } = await uploadImages(files, productId)

      if (uploadErrors) {
        console.error(uploadErrors)
      }
    }

    if (variationsForm) {
      const { variationsError } = await updateProductVariations(variationsForm)

      if (variationsError) {
        console.error(variationsError)
      }
    }

    toast('Produto atualizado com sucesso!')
  }

  useEffect(() => {
    if (productId) {
      handleReadProductImages()
    }
  }, [productId]) //eslint-disable-line

  if (categories && categories.length === 0) {
    return (
      <div className="flex flex-col items-end gap-4">
        <h1 className="text-xl font-bold">
          Você ainda não tem categorias cadastradas
        </h1>
        <p className="text-sm text-muted-foreground">
          Para adicionar produtos, primeiro crie uma categoria.
        </p>
        <Link
          href={`${redirectTo}/categories/register?back=new-product`}
          className={buttonVariants()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar categoria
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <ProductInfo form={form} categories={categories} />

        <ProductImages
          files={files}
          setFiles={setFiles}
          productImages={productImages}
          handleDeleteImage={handleDeleteImage}
        />

        <Dimensions form={form} />

        <Button
          type="submit"
          className="ml-auto"
          disabled={formState.isSubmitting || !formState.isValid}
        >
          {formState.isSubmitting && (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          )}
          {productId ? 'Salvar alterações' : 'Criar produto'}
        </Button>
      </form>
    </Form>
  )
}
