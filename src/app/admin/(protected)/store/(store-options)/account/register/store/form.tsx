'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StoreType } from '@/models/store'
import { Loader2, Trash, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { removeStoreLogo, updateStore } from './actions'
import { uploadLogo } from './client-actions'
import { FileType, LogoUploader } from './logo-uploader'

export const storeSchema = z.object({
  name: z.string(),
  role: z.string(),
})

export function StoreForm({ store }: { store: StoreType | null }) {
  const searchParams = useSearchParams()

  const [file, setFile] = useState<FileType[]>([])

  const name = store?.name ?? ''
  const role = store?.role ?? ''

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name,
      role,
    },
  })

  async function handleDeleteLogo() {
    if (store) {
      const { data, error } = await removeStoreLogo(store?.id)

      if (error) {
        console.error(error)
      }
    }
  }

  async function onSubmit(values: z.infer<typeof storeSchema>) {
    if (store) {
      const { error } = await updateStore(values, store?.id)

      if (error) {
        console.error(error)
        return
      }

      if (file.length > 0) {
        const { uploadError } = await uploadLogo(file, store?.id)

        if (uploadError) {
          console.error(uploadError)
        }
      }

      toast('Informações atualizadas com sucesso')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        {store?.logo_url ? (
          <div className="flex items-center justify-center">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={store?.logo_url} />
                <AvatarFallback>
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>

              <Button
                type="button"
                variant={'outline'}
                size="icon"
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full"
                onClick={handleDeleteLogo}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <LogoUploader files={file} setFiles={setFile} />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da loja</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da loja..." {...field} />
              </FormControl>
              <FormDescription>
                É o nome que aparecerá para seus clientes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nicho</FormLabel>
              <FormControl>
                <Input placeholder="Insira o seu nicho..." {...field} />
              </FormControl>
              <FormDescription>
                Qual o tipo de produtos que você vende?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="ml-auto"
          disabled={
            form.formState.isSubmitting ||
            form.formState.isSubmitted ||
            !form.formState.isValid
          }
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Salvar
        </Button>
      </form>
    </Form>
  )
}
