'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { Loader2, Plus, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSocialMedias } from './actions'
import { SOCIAL_MEDIAS } from './socials'

export const socialFormSchema = z.object({
  socials: z.array(
    z.object({
      social_id: z.string(),
      link: z.string().url('Insira um link válido'),
    }),
  ),
})

export function SocialsForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof socialFormSchema>>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      socials: [{ social_id: '', link: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socials',
  })

  async function onSubmit(values: z.infer<typeof socialFormSchema>) {
    const { createSocialError } = await createSocialMedias(values)

    if (createSocialError) {
      console.error(createSocialError)
      return
    }

    router.push('/admin/onboarding/appearence/logo')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        {fields.map((field, index) => (
          <Card key={field.id} className="relative flex flex-col space-y-4 p-4">
            <FormField
              control={form.control}
              name={`socials.${index}.social_id`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rede social</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
              name={`socials.${index}.link`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o link..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fields.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 right-2"
                onClick={() => remove(index)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            )}
          </Card>
        ))}

        <Button
          type="button"
          onClick={() => append({ social_id: '', link: '' })}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar outra rede social
        </Button>

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
