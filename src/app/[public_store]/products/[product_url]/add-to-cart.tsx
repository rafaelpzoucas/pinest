'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Minus, Plus } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { ProductType, ProductVariationType } from '@/models/product'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ExtraType } from '@/models/extras'
import { useProduct } from '@/stores/productStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { addToCart } from '../../cart/actions'
import { ExtrasSection } from './extras'

const formSchema = z.object({
  variations: z
    .array(
      z.object({
        variation_id: z.string(),
      }),
    )
    .optional(),
  quantity: z.number(),
  observations: z.string().optional(),
})

export type SelectedExtraType = {
  extra_id: string
  name: string
  price: number
  quantity: number
}

type AddToCardDrawerProps = {
  isOpen?: boolean
  product: ProductType
  variations?: ProductVariationType[]
  cartProduct?: CartProductType
  extras?: ExtraType[]
  observations?: string[]
}

export function AddToCart({
  isOpen,
  product,
  variations,
  cartProduct,
  extras,
  observations,
}: AddToCardDrawerProps) {
  const searchParams = useSearchParams()
  const cartProductId = searchParams.get('cart_product_id')

  const selectedVariations = cartProduct?.product_variations

  const {
    productPrice,
    setProductPrice,
    amount,
    setAmount,
    decrease,
    increase,
  } = useProduct()

  const currentAmount = cartProduct?.quantity
  const currentExtras = cartProduct?.extras || []

  const getMergedExtras = () => {
    return extras
      ? extras.map((extra) => {
          const currentExtra = currentExtras?.find(
            (e) => e.extra_id === extra.id,
          )

          return {
            extra_id: extra.id,
            name: extra.name,
            price: extra.price,
            quantity: currentExtra ? currentExtra.quantity : 0,
          }
        })
      : []
  }

  const [selectedExtras, setSelectedExtras] =
    useState<SelectedExtraType[]>(getMergedExtras())

  const groupedByAttribute =
    variations &&
    variations.length > 0 &&
    variations.reduce<
      { id: string; name: string; variations: ProductVariationType[] }[]
    >((acc, variation) => {
      const attributeId = variation.attributes.id
      const attributeName = variation.attributes.name

      let attributeGroup = acc.find((group) => group.name === attributeName)

      if (!attributeGroup) {
        attributeGroup = {
          id: attributeId,
          name: attributeName,
          variations: [],
        }
        acc.push(attributeGroup)
      }

      attributeGroup.variations.push(variation)
      return acc
    }, [])

  const defaultVariations = groupedByAttribute
    ? groupedByAttribute.map((attribute) => ({
        variation_id: attribute.variations[0]?.id,
        price: attribute.variations[0]?.price,
      }))
    : undefined

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variations: selectedVariations ?? defaultVariations,
      quantity: amount ?? 1,
      observations: observations ? observations[0] : '',
    },
  })

  const maxPrice = cartProduct?.product_price
    ? cartProduct.product_price
    : variations && variations?.length > 0
      ? variations.reduce(
          (max, variation) => Math.max(max, variation.price ?? -Infinity),
          -Infinity,
        )
      : null

  const finalMaxPrice = maxPrice === -Infinity ? null : maxPrice

  const totalPrice =
    productPrice +
    selectedExtras.reduce((total, extra) => {
      return total + extra.price * extra.quantity // Corrige a multiplicação de preço e quantidade do extra
    }, 0)

  const { execute: executeAddToCart, isPending: isAddToCartPending } =
    useServerAction(addToCart, {
      onSuccess: () => {
        toast(
          cartProductId
            ? 'Produto atualizado no carrinho.'
            : 'Produto(s) adicionado(s) ao carrinho.',
        )
        if (!cartProductId) {
          form.reset({
            variations: selectedVariations ?? defaultVariations,
            quantity: amount ?? 1,
            observations: '',
          })
        }
        setSelectedExtras(getMergedExtras())
      },
      onError: ({ err }) => {
        toast(`Ocorreu um erro, tente novamente`)
        console.error(err)
      },
    })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newCartProduct: CartProductType = {
      id: cartProduct?.id,
      product_id: product.id,
      products: { ...product, price: productPrice },
      quantity: amount,
      product_variations: values.variations ?? [],
      product_price: productPrice,
      observations: Array(values.observations || '') || [],
      extras: selectedExtras.filter((item) => item.quantity > 0),
    }

    executeAddToCart({ newItem: newCartProduct })
  }

  useEffect(() => {
    setProductPrice(finalMaxPrice ?? product.promotional_price ?? product.price)

    const subscription = form.watch((values, { name, type }) => {
      if (type === 'change' && name?.startsWith('variations')) {
        const selectedVariations =
          values.variations?.flatMap(
            (variation) =>
              variations?.find((v) => v.id === variation?.variation_id) ?? [],
          ) ?? []

        const highestPrice = selectedVariations.reduce((max, variation) => {
          const price = variation?.price ?? -Infinity
          return Math.max(max, price)
        }, -Infinity)

        setProductPrice(
          highestPrice !== -Infinity
            ? highestPrice
            : (product.promotional_price ?? product.price),
        )
      }
    })

    return () => subscription.unsubscribe()
  }, [form, variations, product])

  useEffect(() => {
    setAmount(currentAmount ?? 1)
  }, [product]) // eslint-disable-line

  useEffect(() => {
    setSelectedExtras(getMergedExtras())
  }, [cartProduct])

  const isProductAvailable =
    (product.stock > 0 || product.stock === null) && product.status === 'active'

  if (!isProductAvailable) {
    return (
      <Card className="space-y-2 p-4 border-0 bg-secondary/30">
        <h1 className="text-2xl font-bold">Produto indisponível</h1>
        <p className="text-sm text-muted-foreground">
          Este produto está indisponível no momento.
        </p>
      </Card>
    )
  }
  return (
    <Form {...form}>
      {isOpen ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 max-w-sm"
        >
          {groupedByAttribute && groupedByAttribute.length > 0 && (
            <div className="flex flex-col md:flex-row gap-2">
              {groupedByAttribute.map((attribute, index) => (
                <Card key={attribute.name} className="p-4 pt-3 w-fit">
                  <FormField
                    control={form.control}
                    name={`variations.${index}.variation_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{attribute.name}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row gap-5"
                          >
                            {attribute.variations.map((variation) => (
                              <FormItem
                                key={variation.id}
                                className="flex items-center space-x-2"
                              >
                                <FormControl>
                                  <RadioGroupItem value={variation.id} />
                                </FormControl>
                                <FormLabel className="font-normal !mt-0">
                                  {variation.name}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-4 w-full">
              <div className="flex flex-row items-center gap-3">
                <Button
                  type="button"
                  variant={'secondary'}
                  size={'icon'}
                  onClick={decrease}
                  disabled={amount === 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="text"
                          readOnly
                          className="text-center w-5 bg-transparent"
                          value={amount}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant={'secondary'}
                  size={'icon'}
                  onClick={() => increase(product.stock)}
                  disabled={amount === product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="flex flex-row items-center justify-between w-full max-w-md"
                type="submit"
                disabled={isAddToCartPending || product.stock === 0 || !isOpen}
              >
                {isAddToCartPending ? (
                  <span className="flex flex-row items-center gap-1">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {cartProduct ? 'Atualizando' : 'Adicionando'}
                  </span>
                ) : (
                  <span className="flex flex-row items-center gap-1">
                    <Plus className="w-4 h-4" />
                    {cartProduct ? 'Atualizar' : 'Adicionar'}{' '}
                  </span>
                )}
                <span>{formatCurrencyBRL(totalPrice * amount)}</span>
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Sem cebola, sem picles, etc..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {product.allows_extras && extras && extras.length > 0 && (
            <ExtrasSection
              extras={extras}
              selectedExtrasState={[selectedExtras, setSelectedExtras]}
            />
          )}
        </form>
      ) : (
        <Card className="flex items-center justify-center p-2 bg-destructive text-destructive-foreground">
          <h1>Estamos fechados no momento</h1>
        </Card>
      )}
    </Form>
  )
}
