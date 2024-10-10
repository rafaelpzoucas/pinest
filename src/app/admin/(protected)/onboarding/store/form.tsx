'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import { PhoneInput } from '@/components/ui/input-phone'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { CheckIcon, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createStore, updateStore } from './actions'

export const storeFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome da loja é obrigatório.' }),
  description: z.string().optional(),
  phone: z.string().min(13, { message: 'O telefone é obritatório.' }),
  role: z.string().min(3, { message: 'O nicho é obrigatório.' }),
})

const ROLES = [
  { label: 'Moda e Acessórios', value: 'moda-e-acessorios' },
  { label: 'Eletrônicos', value: 'eletronicos' },
  { label: 'Casa e Decoração', value: 'casa-e-decoracao' },
  { label: 'Beleza e Saúde', value: 'beleza-e-saude' },
  { label: 'Esportes e Lazer', value: 'esportes-e-lazer' },
  { label: 'Alimentos e Bebidas', value: 'alimentos-e-bebidas' },
  { label: 'Livros e Papelaria', value: 'livros-e-papelaria' },
  { label: 'Brinquedos e Jogos', value: 'brinquedos-e-jogos' },
  { label: 'Automóveis e Peças', value: 'automoveis-e-pecas' },
  { label: 'Móveis e Eletrodomésticos', value: 'moveis-e-eletrodomesticos' },
  { label: 'Pet Shop', value: 'pet-shop' },
  { label: 'Jardinagem e Ferramentas', value: 'jardinagem-e-ferramentas' },
  { label: 'Joias e Relógios', value: 'joias-e-relogios' },
  { label: 'Informática e Tecnologia', value: 'informatica-e-tecnologia' },
  { label: 'Bebês e Crianças', value: 'bebes-e-criancas' },
  { label: 'Instrumentos Musicais', value: 'instrumentos-musicais' },
  { label: 'Utilidades Domésticas', value: 'utilidades-domesticas' },
  { label: 'Artigos Religiosos', value: 'artigos-religiosos' },
  { label: 'Arte e Artesanato', value: 'arte-e-artesanato' },
  { label: 'Roupas Íntimas e Lingerie', value: 'roupas-intimas-e-lingerie' },
]

export function StoreForm({ store }: { store: StoreType | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStep = searchParams.get('step')

  const storeNiche = store && store.market_niches[0]

  const form = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: store?.name ?? '',
      description: store?.description ?? '',
      phone: store?.phone ?? '',
      role: storeNiche?.name ?? '',
    },
  })

  async function onSubmit(values: z.infer<typeof storeFormSchema>) {
    if (store) {
      const { storeError } = await updateStore(values)

      if (storeError) {
        console.log(storeError)
      }

      return router.push(`?step=${currentStep}&info=address`)
    }

    const { storeError } = await createStore(values)

    if (storeError) {
      console.log(storeError)
    }

    return router.push(`?step=${currentStep}&info=address`)
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

        <FormField
          control={form.control}
          name="role"
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
                        ? ROLES.find((role) => role.value === field.value)
                            ?.label
                        : 'Selecione o seu nicho'}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search framework..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {ROLES.map((role) => (
                          <CommandItem
                            value={role.label}
                            key={role.value}
                            onSelect={() => {
                              form.setValue('role', role.value)
                            }}
                          >
                            {role.label}
                            <CheckIcon
                              className={cn(
                                'ml-auto h-4 w-4',
                                role.value === field.value
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
        />

        <Button
          type="submit"
          className="ml-auto"
          disabled={form.formState.isSubmitting || form.formState.isSubmitted}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando informações
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </form>
    </Form>
  )
}
