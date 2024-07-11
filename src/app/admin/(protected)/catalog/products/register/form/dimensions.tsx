import { Card, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { newProductFormSchema } from './form'

export function Dimensions({
  form,
}: {
  form: UseFormReturn<z.infer<typeof newProductFormSchema>>
}) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <CardTitle>Dimensões do produto</CardTitle>

      <FormField
        control={form.control}
        name="pkg_weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Peso</FormLabel>
            <FormControl>
              <Input
                type="text"
                maskType="kilo"
                placeholder="Insira o peso do produto..."
                {...field}
              />
            </FormControl>
            <FormDescription>Em quilos (Kg)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pkg_length"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comprimento</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Insira o comprimento do produto..."
                {...field}
              />
            </FormControl>
            <FormDescription>Em centímetros (cm)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pkg_width"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Largura</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Insira a largura do produto..."
                {...field}
              />
            </FormControl>
            <FormDescription>Em centímetros (cm)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pkg_height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Altura</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Insira a altura do produto..."
                {...field}
              />
            </FormControl>
            <FormDescription>Em centímetros (cm)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  )
}
