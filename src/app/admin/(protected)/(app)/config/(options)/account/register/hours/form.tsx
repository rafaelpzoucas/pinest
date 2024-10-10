'use client'

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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { createStoreHours } from './actions'

const hoursFormSchema = z.object({
  week_days: z.array(
    z.object({
      day_of_week: z.string(),
      is_open: z.boolean(),
      open_time: z.string().optional(),
      close_time: z.string().optional(),
    }),
  ),
})

export type HoursFormValues = z.infer<typeof hoursFormSchema>

export function BusinessHoursForm() {
  const router = useRouter()
  const params = useParams()

  const isOnboarding = !!params.current_step

  const [defaultTime, setDefaultTime] = useState({
    open_time: '09:00',
    close_time: '18:00',
  })

  const initialDays: HoursFormValues = {
    week_days: [
      {
        day_of_week: 'Domingo',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: 'Segunda',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: 'Terça',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: 'Quarta',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: 'Quinta',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: 'Sexta',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: 'Sábado',
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
    ],
  }

  const form = useForm<HoursFormValues>({
    resolver: zodResolver(hoursFormSchema),
    defaultValues: initialDays,
  })

  const { fields, update } = useFieldArray({
    control: form.control,
    name: 'week_days',
  })

  const handleOpenTimeChange = (index: number, e: any) => {
    const newTime = e.target.value
    setDefaultTime((prev) => ({ ...prev, open_time: newTime }))

    form.setValue(`week_days.${index}.open_time`, newTime)
  }

  const handleCloseTimeChange = (index: number, e: any) => {
    const newTime = e.target.value
    setDefaultTime((prev) => ({ ...prev, close_time: newTime }))

    form.setValue(`week_days.${index}.close_time`, newTime)
  }

  async function onSubmit(values: HoursFormValues) {
    const { createHoursError } = await createStoreHours(values)

    if (createHoursError) {
      console.error(createHoursError)
    }

    if (isOnboarding) {
      router.push('/admin/onboarding/store/socials')
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
        <div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative border-b last:border-b-0 py-4"
            >
              <Label className="text-lg">
                {field.day_of_week}{' '}
                <span className="text-sm text-muted-foreground">
                  (
                  {form.watch(`week_days.${index}.is_open`)
                    ? 'aberto'
                    : 'fechado'}
                  )
                </span>
              </Label>

              <FormField
                control={form.control}
                name={`week_days.${index}.is_open` as const}
                render={({ field }) => (
                  <FormItem className="absolute top-4 right-0 flex flex-row items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch(`week_days.${index}.is_open`) && (
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name={`week_days.${index}.open_time` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abre às</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={field.value}
                            onChange={(e) => handleOpenTimeChange(index, e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`week_days.${index}.close_time` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha às</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={field.value}
                            onChange={(e) => handleCloseTimeChange(index, e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="ml-auto"
          disabled={form.formState.isSubmitting || form.formState.isSubmitted}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando horários
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </form>
    </Form>
  )
}
