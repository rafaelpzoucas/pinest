'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { CategoryType } from '@/models/category'
import {
  ProductImageType,
  ProductType,
  ProductVariationsType,
} from '@/models/product'
import { Loader, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createProduct, deleteProductImage, updateProduct } from '../actions'
import { readProductImages, uploadImages } from '../client-actions'
import { createProductVariations } from './actions'
import { Dimensions } from './dimensions'
import { FileType } from './file-uploader'
import { ProductImages } from './product-images'
import { ProductInfo } from './product-info'
import { Variations } from './variations'

export const newProductFormSchema = z.object({
  category_id: z.string().min(1),
  name: z.string({ required_error: 'Por favor, preencha o nome do produto.' }),
  description: z.string({ required_error: 'Por favor, insira uma descrição.' }),
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
    (product &&
      product.product_variations?.map((variation) => ({
        id: variation.id,
        attribute: variation.attributes.name,
        product_variations: {
          id: variation.id,
          name: variation.name,
          price: variation.price,
          stock: variation.stock,
        },
      }))) ??
    []

  const groupedVariations = defaultVariations.reduce(
    (acc, variation) => {
      if (!acc[variation.attribute]) {
        acc[variation.attribute] = {
          id: variation.id,
          attribute: variation.attribute,
          product_variations: [],
        }
      }

      acc[variation.attribute].product_variations.push(
        variation.product_variations,
      )

      return acc
    },
    {} as Record<
      string,
      {
        id: string
        attribute: string
        product_variations: (typeof defaultVariations)[0]['product_variations'][]
      }
    >,
  )

  const groupedVariationsArray = Object.values(groupedVariations)

  const [files, setFiles] = useState<FileType[]>([])
  const [productImages, setProductImages] = useState<ProductImageType[]>([])
  const [variationsForm, setVariationsForm] = useState<ProductVariationsType[]>(
    groupedVariationsArray,
  )

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
    console.log(values)

    if (!productId) {
      const { createdProduct, createdProductError } =
        await createProduct(values)

      if (createdProductError) {
        console.error(createdProductError)
        return
      }

      if (createdProduct) {
        if (files.length > 0) {
          const { uploadErrors } = await uploadImages(files, createdProduct.id)

          if (uploadErrors) {
            console.error(uploadErrors)
          }
        }
      }

      if (variationsForm.length > 0 && createdProduct) {
        await createProductVariations(variationsForm, createdProduct.id)
      }

      return router.back()
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

    if (variationsForm.length > 0) {
      await createProductVariations(variationsForm, productId)
    }

    toast('Produto atualizado com sucesso!')
  }

  useEffect(() => {
    if (productId) {
      handleReadProductImages()
    }
  }, [productId]) //eslint-disable-line

  console.log(categories?.length)

  if (!categories || categories?.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
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
        className="flex flex-col w-full space-y-6 pb-16"
      >
        <div className="flex flex-col w-full space-y-6">
          <ProductImages
            files={files}
            setFiles={setFiles}
            productImages={productImages}
            handleDeleteImage={handleDeleteImage}
          />

          <ProductInfo form={form} categories={categories} />

          <Variations
            variations={variationsForm}
            setVariations={setVariationsForm}
          />

          <Dimensions form={form} />

          <footer className="fixed bottom-0 left-0 right-0 flex p-4">
            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full max-w-sm ml-auto"
            >
              {formState.isSubmitting && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              {productId ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </footer>
        </div>
      </form>
    </Form>
  )
}
