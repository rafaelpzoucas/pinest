'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger as ShadSelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectTrigger } from '@radix-ui/react-select'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateStoreTheme } from './actions'
import { appearenceFormSchema } from './schemas'

const availableThemeColors = [
  { name: 'Zinc', light: 'bg-zinc-900', dark: 'bg-zinc-700' },
  { name: 'Rose', light: 'bg-rose-900', dark: 'bg-rose-700' },
  { name: 'Red', light: 'bg-red-900', dark: 'bg-red-700' },
  { name: 'Orange', light: 'bg-orange-900', dark: 'bg-orange-700' },
  { name: 'Yellow', light: 'bg-yellow-900', dark: 'bg-yellow-700' },
  { name: 'Violet', light: 'bg-violet-900', dark: 'bg-violet-700' },
  { name: 'Blue', light: 'bg-blue-900', dark: 'bg-blue-700' },
  { name: 'Green', light: 'bg-green-900', dark: 'bg-green-700' },
]

export function AppearenceForm({ store }: { store: StoreType | null }) {
  const { theme } = useTheme()

  const form = useForm<z.infer<typeof appearenceFormSchema>>({
    resolver: zodResolver(appearenceFormSchema),
    defaultValues: {
      theme_color: store?.theme_color ?? '',
      theme_mode: store?.theme_mode ?? '',
    },
  })

  const createSelectItems = () => {
    return availableThemeColors.map(({ name, light, dark }) => (
      <SelectItem key={name} value={name}>
        <div className="flex items-center justify-center space-x-3">
          <div
            className={cn(
              'rounded-full',
              'w-6 h-6',
              theme === 'light' ? light : dark,
            )}
          ></div>
        </div>
      </SelectItem>
    ))
  }

  const watchThemeColor = form.watch('theme_color')
  const watchThemeMode = form.watch('theme_mode')

  async function onSubmit() {
    const themeColor = form.getValues('theme_color')
    const themeMode = form.getValues('theme_mode')

    const values: z.infer<typeof appearenceFormSchema> = {
      theme_color: themeColor,
      theme_mode: themeMode,
    }

    if (store) {
      await updateStoreTheme(values)
    }
  }

  useEffect(() => {
    onSubmit()
  }, [watchThemeColor, watchThemeMode])

  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <h3 className="text-lg font-bold">Aparência da loja</h3>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <FormField
            control={form.control}
            name="theme_color"
            render={({ field }) => {
              const selectedColor = availableThemeColors.find(
                (c) => c.name === field.value,
              )
              return (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <Card className="flex flex-col items-center">
                      <CardHeader>
                        <CardTitle>Cor da marca</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SelectTrigger className="border rounded-lg focus:outline-none">
                          <div
                            className={cn(
                              'w-[250px] h-12 rounded-lg',
                              theme === 'light'
                                ? selectedColor?.light
                                : selectedColor?.dark,
                            )}
                          ></div>
                        </SelectTrigger>
                      </CardContent>
                      <SelectContent>
                        <div className="grid grid-cols-4">
                          {createSelectItems()}
                        </div>
                      </SelectContent>
                    </Card>
                  </Select>
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="theme_mode"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <Card className="flex flex-col items-center h-full">
                    <CardHeader>
                      <CardTitle>Tema</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center w-full">
                      <FormControl>
                        <ShadSelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Selecione o tema da sua loja" />
                        </ShadSelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex flex-row items-center">
                            <Sun className="w-4 h-4 mr-2" />
                            Tema Claro
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex flex-row items-center">
                            <Moon className="w-4 h-4 mr-2" />
                            Tema Escuro
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </CardContent>
                  </Card>
                </Select>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Card>
  )
}
