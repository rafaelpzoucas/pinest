'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

const formSchema = z.object({
  search: z.string(),
})

export function SearchSheet({ subdomain }: { subdomain?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q')

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: query ?? '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSheetOpen(false)

    return router.push(`/${subdomain}/search?q=${values.search}`)
  }

  if (!subdomain) {
    return (
      <>
        <div className="lg:hidden">
          <div
            className="hidden lg:flex items-center h-9 w-full rounded-md border border-input
              bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-sm"
          >
            <span>{query ?? 'Buscar na loja'}</span>
          </div>

          <div className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <Search className="lg:hidden w-5 h-5" />
          </div>
        </div>

        <Skeleton className="hidden lg:block w-[265px] h-9" />
      </>
    )
  }

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <div className="lg:hidden">
            <div
              className="hidden lg:flex items-center h-9 w-full rounded-md border border-input
                bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-sm"
            >
              <span>{query ?? 'Buscar na loja'}</span>
            </div>

            <div className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
              <Search className="lg:hidden w-5 h-5" />
            </div>
          </div>
        </SheetTrigger>
        <SheetContent autoFocus side="fade" className="h-[100dvh]">
          <SheetHeader className="flex flex-row gap-2 items-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FormField
                  control={form.control}
                  name="search"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="search"
                          placeholder="Buscar na loja..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <SheetClose className="flex items-center justify-center w-full max-w-8 h-8 aspect-square !mt-0">
              <X className="w-5 h-5" />
            </SheetClose>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="hidden lg:flex justify-end flex-row gap-2 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    type="search"
                    placeholder="Buscar na loja..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant={'outline'}
            size={'icon'}
            className="w-full max-w-9"
          >
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </Form>
    </>
  )
}
