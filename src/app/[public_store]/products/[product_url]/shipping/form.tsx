'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrencyBRL, formatDistanceToFuture } from '@/lib/utils'
import { RequestSimularType, ShippingType } from '@/models/kangu-shipping'
import { ProductType } from '@/models/product'
import { AddressType } from '@/models/user'
import { useProduct } from '@/stores/productStore'
import { Loader2, Truck } from 'lucide-react'
import { useState } from 'react'

type ShippingPropsType = {
  product: ProductType
  publicStore: string
  storeAddress: AddressType
}

const formSchema = z.object({
  zip_code: z.string().min(9, { message: 'Por favor, insira um CEP válido.' }),
})

export function ShippingForm({
  product,
  publicStore,
  storeAddress,
}: ShippingPropsType) {
  const { amount } = useProduct()

  const [shipping, setShipping] = useState<ShippingType[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zip_code: '',
    },
  })

  async function handleSimulateShipping(zipCode: string) {
    const simulationData: RequestSimularType = {
      cepOrigem: storeAddress.zip_code,
      cepDestino: zipCode,
      vlrMerc: product.price,
      pesoMerc: product.pkg_weight,
      volumes: [
        {
          peso: product.pkg_weight,
          altura: product.pkg_height,
          largura: product.pkg_width,
          comprimento: product.pkg_length,
          tipo: '',
          valor: product.price,
          quantidade: amount ?? 1,
        },
      ],
      produtos: [
        {
          peso: product.pkg_weight,
          altura: product.pkg_height,
          largura: product.pkg_width,
          comprimento: product.pkg_length,
          valor: product.price,
          quantidade: amount ?? 1,
          produto: product.name,
        },
      ],
      servicos: ['E', 'X', 'M', 'R'],
      ordernar: 'preco',
    }

    try {
      const response = await fetch('/api/v1/shipping/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicStore, simulationData }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro: ${errorText}`)
      }

      const data = await response.json()
      setShipping(data)
    } catch (error) {
      console.error('Erro ao simular frete:', error)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const zipCode = values.zip_code.replaceAll('-', '')

    await handleSimulateShipping(zipCode)
  }

  return (
    <section className="space-y-6 w-full max-w-lg">
      <div className="flex flex-col md:flex-row gap-2 md:gap-6">
        <div className="flex flex-row items-center gap-3 text-muted-foreground">
          <Truck className="w-8 h-8" />
          <p className="w-full max-w-48 text-sm">Frete e prazo de entrega</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative w-full"
          >
            <FormField
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      maskType="cep"
                      placeholder="Insira seu CEP..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="ghost"
              className="absolute right-1 top-1 h-7"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {form.formState.isSubmitting ? 'Calculando' : 'Calcular'}
            </Button>
          </form>
        </Form>
      </div>

      {shipping.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Frete</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Prazo de entrega</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipping.map((shipping) => (
                <TableRow key={shipping.idTransp}>
                  <TableCell>{shipping.descricao}</TableCell>
                  <TableCell>{formatCurrencyBRL(shipping.vlrFrete)}</TableCell>
                  <TableCell>
                    {formatDistanceToFuture(shipping.dtPrevEnt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  )
}
