'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()

  return (
    <div>
      <header className="flex flex-row items-center gap-4">
        <Button
          variant={'secondary'}
          size={'icon'}
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        {/* <h1 className="text-lg text-center font-bold">Voltar</h1> */}
      </header>
    </div>
  )
}
