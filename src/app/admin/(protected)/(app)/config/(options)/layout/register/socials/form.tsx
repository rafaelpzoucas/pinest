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
import { SocialMediaType } from '@/models/social'
import { Loader2, Plus, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import {
  createSocialMedias,
  deleteSocialMedia,
  updateSocialMedia,
} from './actions'
import { SOCIAL_MEDIAS } from './socials'

export const socialFormSchema = z.object({
  socials: z.array(
    z.object({
      social_id: z.string(),
      link: z.string().url('Insira um link válido'),
      id: z.string().optional(),
      created_at: z.string().optional(),
      store_id: z.string().optional(),
    }),
  ),
})

export function SocialsForm({
  storeSocials,
}: {
  storeSocials?: SocialMediaType[] | null
}) {
  const router = useRouter()
  const params = useParams()

  const isOnboarding = !!params.current_step

  const defaultSocials =
    storeSocials && storeSocials.length > 0
      ? storeSocials.map((storeSocial) => storeSocial)
      : undefined

  const form = useForm<z.infer<typeof socialFormSchema>>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      socials: defaultSocials ?? [{ social_id: '', link: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socials',
  })

  async function handleDeleteSocial(index: number) {
    if (storeSocials) {
      const { error } = await deleteSocialMedia(storeSocials[index].id)

      if (error) {
        console.error(error)
        return null
      }
    }

    remove(index)
  }

  async function onSubmit(values: z.infer<typeof socialFormSchema>) {
    const socialsToUpdate = values.socials.filter((social) =>
      storeSocials?.some((stored) => stored.social_id === social.social_id),
    )
    const socialsToCreate = values.socials.filter(
      (social) =>
        !storeSocials?.some((stored) => stored.social_id === social.social_id),
    )

    if (socialsToUpdate.length > 0) {
      await updateSocialMedia({ socials: socialsToUpdate })
    }

    if (socialsToCreate.length > 0) {
      const { createSocialError } = await createSocialMedias({
        socials: socialsToCreate,
      })

      if (createSocialError) {
        console.error(createSocialError)
        return
      }
    }

    if (isOnboarding) {
      router.push('/admin/onboarding/appearence/logo')
    } else {
      router.back()
    }
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
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 right-2"
                onClick={() => handleDeleteSocial(index)}
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
