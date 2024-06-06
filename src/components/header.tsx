'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export function Header({ title }: { title?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  const callback = searchParams.get('callback')

  function redirect() {
    if (callback) {
      router.push(`/${params.public_store}`)
    } else {
      router.back()
    }
  }

  return (
    <header className="grid grid-cols-[1fr_5fr_1fr] items-center pb-4 w-full">
      <Button variant={'ghost'} size={'icon'} onClick={redirect}>
        <ArrowLeft />
      </Button>

      {title && <h1 className="text-xl text-center font-bold">{title}</h1>}
    </header>
  )
}
