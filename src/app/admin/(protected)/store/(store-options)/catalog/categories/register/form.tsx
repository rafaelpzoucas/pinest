'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createCategory, updateCategory } from '../actions'

export const newCategoryFormSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export function CategoryForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pathnameParts = pathname.split('/')
  pathnameParts.pop()
  pathnameParts.pop()
  const redirectTo = pathnameParts.join('/')

  const back = searchParams.get('back')
  const defaultId = searchParams.get('id')

  const form = useForm<z.infer<typeof newCategoryFormSchema>>({
    resolver: zodResolver(newCategoryFormSchema),
    defaultValues: {
      name: searchParams.get('name') ?? '',
      description: searchParams.get('description') ?? '',
    },
  })

  const formState = form.formState

  async function onSubmit(values: z.infer<typeof newCategoryFormSchema>) {
    if (defaultId) {
      const { error } = await updateCategory(defaultId, values)

      if (error) {
        console.log(error)
        return null
      }

      return router.push(`${redirectTo}?tab=categories`)
    }

    const { error } = await createCategory(values)

    if (error) {
      console.log(error)
      return null
    }

    if (back) {
      return router.push(`${redirectTo}/products/register`)
    }

    return router.push(`${redirectTo}?tab=categories`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da categoria..." {...field} />
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
                  placeholder="Digite uma descrição para a categoria..."
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
          disabled={
            formState.isSubmitting ||
            formState.isSubmitted ||
            !form.formState.isDirty ||
            !formState.isValid
          }
        >
          {form.formState.isSubmitting && (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          )}
          {defaultId ? 'Salvar' : 'Criar categoria'}
        </Button>
      </form>
    </Form>
  )
}
