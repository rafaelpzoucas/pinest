'use client'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

const formSchema = z.object({
  search: z.string().min(2).max(50),
})

export function SearchSheet({ publicStore }: { publicStore: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: searchParams.get('q') ?? '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSheetOpen(false)
    return router.push(`/${publicStore}/search?q=${values.search}`)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <div className="flex items-center h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-sm">
          <span>Buscar na loja</span>
        </div>
      </SheetTrigger>
      <SheetContent autoFocus side="top" className="h-[100dvh]">
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
  )
}
