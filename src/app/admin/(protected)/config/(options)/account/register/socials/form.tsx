'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createSocialMedia } from './actions'
import { SOCIAL_MEDIAS } from './socials'

export const socialFormSchema = z.object({
  link: z.string(),
  social_id: z.string(),
})

export function SocialsForm() {
  const form = useForm<z.infer<typeof socialFormSchema>>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      link: '',
      social_id: '',
    },
  })

  const socialId = form.watch('social_id')
  const selectedSocial = SOCIAL_MEDIAS.find(
    (media) => media.id === socialId,
  )?.label

  async function onSubmit(values: z.infer<typeof socialFormSchema>) {
    const { createSocialError } = await createSocialMedia(values)

    if (createSocialError) {
      console.error(createSocialError)
      return
    }

    toast(`${selectedSocial} adicionado com sucesso`)

    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="social_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rede social</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma rede social..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SOCIAL_MEDIAS.map((media) => (
                    <SelectItem key={media.id} value={media.id}>
                      {media.label}
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
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Link {selectedSocial ? `do ${selectedSocial}` : ''}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={`Insira o seu link${selectedSocial ? ' do ' + selectedSocial : ''}...`}
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
          disabled={form.formState.isSubmitting}
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
