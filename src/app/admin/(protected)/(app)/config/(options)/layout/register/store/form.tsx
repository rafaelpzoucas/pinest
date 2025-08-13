'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StoreType } from '@/models/store'
import { Loader2 } from 'lucide-react'

import { PhoneInput } from '@/components/ui/input-phone'

import {
  useCreateAdminStore,
  useUpdateAdminStore,
} from '@/features/admin/stores/hooks'
import { createAdminStoreSchema } from '@/features/admin/stores/schemas'
import { MarketNicheType } from '@/models/market-niches'
import { useParams, useRouter } from 'next/navigation'

export function StoreForm({
  store,
}: {
  store?: StoreType
  marketNiches?: MarketNicheType[] | null
}) {
  const router = useRouter()
  const params = useParams()

  const isOnboarding = !!params.current_step

  const name = store?.name ?? ''
  const description = store?.description ?? ''
  const phone = store?.phone ?? ''

  const form = useForm<z.infer<typeof createAdminStoreSchema>>({
    resolver: zodResolver(createAdminStoreSchema),
    defaultValues: {
      name,
      description,
      phone,
    },
  })

  const { mutate: createStore, isPending: isCreatingStore } =
    useCreateAdminStore({
      onSuccess: () => {
        if (isOnboarding) {
          router.push('address')
        } else {
          router.back()
        }
      },
    })

  const { mutate: updateStore, isPending: isUpdatingStore } =
    useUpdateAdminStore({
      onSuccess: () => {
        if (isOnboarding) {
          router.push('address')
        } else {
          router.back()
        }
      },
    })

  async function onSubmit(values: z.infer<typeof createAdminStoreSchema>) {
    if (store) {
      updateStore({ ...values, id: store.id })
    } else {
      // Usar a mutation aqui
      createStore(values)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da loja</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Digite o nome da loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                É o nome que aparecerá para seus clientes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da loja (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Insira uma descrição para a loja..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone de atendimento</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormDescription>Número de WhatsApp da loja.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="market_niche_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Nicho</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'justify-between',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? marketNiches &&
                          marketNiches.find((niche) => niche.id === field.value)
                            ?.name
                        : 'Selecione o seu nicho'}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Pesquisar nicho..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum nicho encontrado.</CommandEmpty>
                      <CommandGroup>
                        {marketNiches &&
                          marketNiches.map((niche) => (
                            <CommandItem
                              value={niche.name}
                              key={niche.id}
                              onSelect={() => {
                                form.setValue('market_niche_id', niche.id)
                              }}
                            >
                              <div className="flex flex-col items-start max-w-80">
                                {niche.name}{' '}
                                <span className="text-xs text-muted-foreground">
                                  {niche.description}
                                </span>
                              </div>
                              <CheckIcon
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  niche.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Qual o tipo de produtos que você vende?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button
          type="submit"
          className="ml-auto"
          disabled={isCreatingStore || isUpdatingStore}
        >
          {isCreatingStore || isUpdatingStore ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando informações
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </form>
    </Form>
  )
}
