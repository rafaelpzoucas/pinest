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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { createCoupon, updateCoupon } from './actions'
import { CouponFormValues, couponSchema } from './schema'

export function CouponForm({ coupon }: { coupon?: CouponFormValues }) {
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      ...coupon,
      status: coupon?.status ?? 'active',
      discount_type: 'percent',
      expires_at: coupon?.expires_at ?? undefined,
      usage_limit: coupon?.usage_limit ?? undefined,
      usage_limit_per_customer: coupon?.usage_limit_per_customer ?? undefined,
    },
  })

  const { execute: executeCreate, isPending: isCreating } = useServerAction(
    createCoupon,
    {
      onSuccess: () => {
        toast.success('Cupom cadastrado com sucesso!')
        form.reset({})
      },
      onError: ({ err }) => {
        toast.error(err.message || 'Erro ao criar cupom.')
      },
    },
  )
  const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
    updateCoupon,
    {
      onSuccess: () => {
        toast.success('Cupom atualizado com sucesso!')
      },
      onError: ({ err }) => {
        toast.error(err.message || 'Erro ao atualizar cupom.')
      },
    },
  )
  // Força uppercase no código
  const codeValue = form.watch('code')

  const isPercent = form.watch('discount_type') === 'percent'

  const isLoading = isCreating || isUpdating

  async function onSubmit(data: CouponFormValues) {
    if (coupon) {
      executeUpdate(data)
    } else {
      executeCreate(data)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Black Friday 2024" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={20}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase()
                    form.setValue('code', upper)
                  }}
                  value={codeValue || ''}
                  placeholder="Ex: BLACK2024"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de desconto</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="percent"
                        id="discount-type-percent"
                      />
                      <Label htmlFor="discount-type-percent">
                        Porcentagem (%)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="discount-type-fixed" />
                      <Label htmlFor="discount-type-fixed">
                        Valor fixo (R$)
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    maskType={isPercent ? 'percent' : 'currency'}
                    className="max-w-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="status-active" />
                    <Label htmlFor="status-active">Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disabled" id="status-disabled" />
                    <Label htmlFor="status-disabled">Desativado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expired" id="status-expired" />
                    <Label htmlFor="status-expired">Expirado</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de expiração</FormLabel>
              <FormControl>
                <Input type="date" {...field} placeholder="Ex: 2024-12-31" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usage_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de uso total</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder="Ex: 100 (deixe vazio para ilimitado)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usage_limit_per_customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de uso por cliente</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder="Ex: 1 (deixe vazio para ilimitado)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Salvando Cupom
            </>
          ) : (
            'Salvar Cupom'
          )}
        </Button>
      </form>
    </Form>
  )
}
