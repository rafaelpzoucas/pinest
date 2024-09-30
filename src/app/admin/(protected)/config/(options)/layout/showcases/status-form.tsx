'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { ShowcaseType } from '@/models/showcase'
import { updateShowcaseStatus } from './register/actions'

export const showcaseStatusFormSchema = z.object({
  status: z.boolean().default(false).optional(),
})

export function StatusForm({ showcase }: { showcase: ShowcaseType }) {
  const form = useForm<z.infer<typeof showcaseStatusFormSchema>>({
    resolver: zodResolver(showcaseStatusFormSchema),
    defaultValues: {
      status: showcase.status,
    },
  })

  async function onSubmit(data: z.infer<typeof showcaseStatusFormSchema>) {
    await updateShowcaseStatus(showcase.id, data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    form.handleSubmit(onSubmit)()
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
