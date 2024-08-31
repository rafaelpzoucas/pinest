import { Card, CardTitle } from '@/components/ui/card'
import {
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
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { CategoryType } from '@/models/category'
import { newProductFormSchema } from './form'

export function ProductInfo({
  form,
  categories,
}: {
  form: UseFormReturn<z.infer<typeof newProductFormSchema>>
  categories: CategoryType[] | null
}) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <CardTitle>Informações do produto</CardTitle>

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories &&
                  categories.map((category) => (
                    <SelectItem value={category.id} key={category.id}>
                      {category.name}
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
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Insira o nome do produto..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Input
                placeholder="Insira uma descrição para o produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço</FormLabel>
            <FormControl>
              <Input
                type="string"
                maskType="currency"
                placeholder="Insira o preço do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="promotional_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço promocional (opcional)</FormLabel>
            <FormControl>
              <Input
                type="string"
                maskType="currency"
                placeholder="Insira o preço promocional do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estoque</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Insira o estoque do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU (opcional)</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Insira o estoque do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  )
}
