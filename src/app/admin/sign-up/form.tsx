'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
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
import { useState } from 'react'

const formSchema = z.object({
  user: z.string().email({
    message: 'Digite um e-mail válido.',
  }),
  password: z.string().min(8, {
    message: 'A senha deve ter no mínimo 8 caracteres.',
  }),
})

export function SignInForm() {
  const [confirmPassword, setConfirmPassword] = useState('')

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const password = form.watch('password')
  const isPasswordsEqual = password === confirmPassword

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  console.log(password, confirmPassword, isPasswordsEqual)
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
        <FormItem>
          <FormLabel>Confirme sua senha</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Digite novamente sua senha..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          {!isPasswordsEqual && confirmPassword !== '' && (
            <FormDescription className="text-destructive">
              As senhas precisam estar iguais
            </FormDescription>
          )}
        </FormItem>
        <Button type="submit" className="w-full">
          Entrar
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
