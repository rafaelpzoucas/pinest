'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductImageType } from '@/models/product'
import { Loader, Plus, Trash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CategoryType } from '../../categories/actions'
import { createProduct, deleteProductImage, updateProduct } from './actions'
import { readProductImages, uploadImages } from './client-actions'
import { FileType, FileUploader } from './file-uploader'

export const newProductFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.string(),
  stock: z.string(),
  category_id: z.string(),
  images: z.any(),
})

export function ProductForm({
  categories,
}: {
  categories: CategoryType[] | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [files, setFiles] = useState<FileType[]>([])
  const [productImages, setProductImages] = useState<ProductImageType[]>([])

  const pathnameParts = pathname.split('/')
  pathnameParts.pop()
  pathnameParts.pop()
  const redirectTo = pathnameParts.join('/')

  const productId = searchParams.get('id')

  const form = useForm<z.infer<typeof newProductFormSchema>>({
    resolver: zodResolver(newProductFormSchema),
    defaultValues: {
      name: searchParams.get('name') ?? '',
      description: searchParams.get('description') ?? '',
      price: searchParams.get('price') ?? '',
      stock: searchParams.get('stock') ?? '',
      category_id: searchParams.get('category_id') ?? '',
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
    if (files.length > 0 && productId) {
      const { uploadErrors } = await uploadImages(files, productId)

      if (uploadErrors) {
        console.error(uploadErrors)
      }
    }

    if (productId) {
      const { error } = await updateProduct(productId, values)

      if (error) {
        console.log(error)
        return null
      }

      return router.push(`${redirectTo}?tab=products`)
    }

    const { error } = await createProduct(values)

    if (error) {
      console.log(error)
      return null
    }

    return router.push(`${redirectTo}?tab=products`)
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
          Voce ainda não tem categorias cadastradas
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
        {productId && <FileUploader files={files} setFiles={setFiles} />}

        <section className="grid grid-cols-4 gap-2">
          {productImages.length > 0 &&
            productImages.map((image) => (
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

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories &&
                    categories.map((category) => (
                      <SelectItem value={category.id} key={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do produto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite uma descrição para o produto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Digite o preço do produto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estoque</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Insira o estoque do produto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="ml-auto"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting && (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          )}
          {productId ? 'Salvar' : 'Criar produto'}
        </Button>
      </form>
    </Form>
  )
}
