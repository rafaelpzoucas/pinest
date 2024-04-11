'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const formSchema = z.object({
  user: z.string().email({
    message: 'Digite um e-mail válido.',
  }),
  password: z.string().min(8, {
    message: 'A senha deve ter no mínimo 8 caracteres.',
  }),
  confirm_password: z.string().min(8),
  terms: z.literal(true),
})

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const step = searchParams.get('step')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const password = form.watch('password')
  const confirmPassword = form.watch('confirm_password')
  const isPasswordsEqual = password === confirmPassword

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    router.push('?step=confirm-email')
  }

  if (step === 'confirm-email') {
    return (
      <div className="text-center space-y-6 mt-4">
        <h1 className="text-2xl font-bold">Confirme seu e-mail</h1>

        <p className="text-muted-foreground">
          Enviamos um e-mail para você, abra sua caixa de e-mails e clique no
          link para confirmar o seu cadastro.
        </p>

        <Link href="/admin/sign-in" className={cn(buttonVariants(), 'w-full')}>
          Acessar conta
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-6"
      >
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu E-mail..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite sua senha..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirme sua senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite novamente sua senha..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {!isPasswordsEqual && confirmPassword !== '' && (
                <FormDescription className="text-destructive">
                  As senhas precisam estar iguais
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Aceito os{' '}
                  <Link
                    href="#"
                    className={cn(
                      buttonVariants({ variant: 'link' }),
                      form.formState.errors.terms && 'text-destructive',
                      'p-0 h-fit',
                    )}
                  >
                    Termos e Condições
                  </Link>{' '}
                  e a{' '}
                  <Link
                    href="#"
                    className={cn(
                      buttonVariants({ variant: 'link' }),
                      form.formState.errors.terms && 'text-destructive',
                      'p-0 h-fit',
                    )}
                  >
                    Política de Privacidade
                  </Link>{' '}
                  da Ztore.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={!isPasswordsEqual && !form.formState.isValid}
        >
          Continuar
        </Button>
      </form>

      <div className="text-center space-y-8">
        <p>
          Já tem uma loja?
          <Link
            href="/admin/sign-in"
            className={cn(buttonVariants({ variant: 'link' }))}
          >
            Acesse sua conta
          </Link>
        </p>
      </div>
    </Form>
  )
}
