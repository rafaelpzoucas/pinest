'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header({ title }: { title?: string }) {
  const router = useRouter()

  return (
    <header className="grid grid-cols-[1fr_5fr_1fr] items-center pb-4 w-full">
      <Button variant={'ghost'} size={'icon'} onClick={() => router.back()}>
        <ArrowLeft />
      </Button>

      {title && <h1 className="text-xl text-center font-bold">{title}</h1>}
    </header>
  )
}
