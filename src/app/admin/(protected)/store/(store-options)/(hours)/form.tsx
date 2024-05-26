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
import { Loader } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { HoursType } from './actions'

export const hoursFormSchema = z.object({
  sunday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
  monday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
  tuesday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
  wednesday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
  thursday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
  friday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
  saturday: z.object({
    open_time: z.string(),
    close_time: z.string(),
  }),
})

export function HoursForm({ hours }: { hours: HoursType[] | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pathnameParts = pathname.split('/')
  pathnameParts.pop()
  pathnameParts.pop()
  const redirectTo = pathnameParts.join('/')

  const defaultId = searchParams.get('id')

  const form = useForm<z.infer<typeof hoursFormSchema>>({
    resolver: zodResolver(hoursFormSchema),
    defaultValues: {
      sunday: {
        open_time: '',
        close_time: '',
      },
      monday: {
        open_time: '',
        close_time: '',
      },
      tuesday: {
        open_time: '',
        close_time: '',
      },
      wednesday: {
        open_time: '',
        close_time: '',
      },
      thursday: {
        open_time: '',
        close_time: '',
      },
      friday: {
        open_time: '',
        close_time: '',
      },
      saturday: {
        open_time: '',
        close_time: '',
      },
    },
  })

  const formState = form.formState

  async function onSubmit(values: z.infer<typeof hoursFormSchema>) {
    // const { error } = await createHour(values)

    // if (error) {
    //   console.log(error)
    //   return null
    // }
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <Card className="p-4 space-y-2">
          <CardTitle>Domingo</CardTitle>

          <div className="flex flex-row gap-2 w-full">
            <FormField
              control={form.control}
              name="sunday.open_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Abre às</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunday.close_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Fecha às</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Button
          type="submit"
          className="ml-auto"
          disabled={
            formState.isSubmitting || !formState.isDirty || !formState.isValid
          }
        >
          {formState.isSubmitting && (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          )}
          Salvar horários
        </Button>
      </form>
    </Form>
  )
}
