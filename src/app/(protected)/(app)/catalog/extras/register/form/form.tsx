'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ExtraType } from '@/models/extras'
import { Loader } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createExtra, updateExtra } from './actions'

export const newExtraFormSchema = z.object({
  name: z.string({
    required_error: 'Por favor, preencha o nome do adicional.',
  }),
  price: z.string().optional(),
})

export function ExtraForm({ extra }: { extra: ExtraType | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const pathnameParts = pathname.split('/')
  pathnameParts.pop()
  pathnameParts.pop()

  const extraId = extra?.id

  const form = useForm<z.infer<typeof newExtraFormSchema>>({
    resolver: zodResolver(newExtraFormSchema),
    defaultValues: {
      name: extra?.name ?? undefined,
      price: extra?.price?.toString() ?? undefined,
    },
  })

  const formState = form.formState

  async function onSubmit(values: z.infer<typeof newExtraFormSchema>) {
    if (!extraId) {
      const { error } = await createExtra(values)

      if (error) {
        console.error(error)
        return
      }

      return router.back()
    }

    const { error } = await updateExtra(extraId, values)

    if (error) {
      console.error(error)
      return null
    }

    toast('Adicional atualizado com sucesso!')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6 pb-16"
      >
        <div className="flex flex-col w-full space-y-6">
          <Card className="flex flex-col gap-4 p-4">
            <CardTitle>Informações do adicional</CardTitle>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o nome do adicional..."
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
                      type="string"
                      maskType="currency"
                      placeholder="Insira o preço do adicional..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <footer className="fixed bottom-0 left-0 right-0 flex p-4">
            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full max-w-sm ml-auto"
            >
              {formState.isSubmitting && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              {extraId ? 'Salvar alterações' : 'Criar adicional'}
            </Button>
          </footer>
        </div>
      </form>
    </Form>
  )
}
