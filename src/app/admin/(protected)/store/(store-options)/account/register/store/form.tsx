'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { Label } from '@/components/ui/label'
import { Loader2, Trash } from 'lucide-react'
import Image from 'next/image'
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

export function StoreForm() {
  const searchParams = useSearchParams()

  const id = searchParams.get('id') ?? ''
  const name = searchParams.get('name') ?? ''
  const role = searchParams.get('role') ?? ''
  const logoUrl = searchParams.get('logo_url') ?? ''

  const [file, setFile] = useState<FileType[]>([])

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name,
      role,
    },
  })

  async function handleDeleteLogo() {
    const { data, error } = await removeStoreLogo(name)

    if (error) {
      console.error(error)
    }
  }

  async function onSubmit(values: z.infer<typeof storeSchema>) {
    const { error } = await updateStore(values, id)

    if (error) {
      console.error(error)
      return
    }

    if (file.length > 0) {
      const { uploadError } = await uploadLogo(file, id)

      if (uploadError) {
        console.error(uploadError)
      }
    }

    toast('Informações atualizadas com sucesso')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <Label>Logo</Label>

        {logoUrl ? (
          <div className="relative">
            <Image src={logoUrl} alt="" width={200} height={200} />
            <Button
              type="button"
              variant={'outline'}
              size="icon"
              className="absolute top-0 right-0 w-8 h-8"
              onClick={handleDeleteLogo}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <LogoUploader files={file} setFiles={setFile} logoUrl={logoUrl} />
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
