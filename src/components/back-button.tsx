'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

export function BackButton() {
  const router = useRouter()

  function getBack() {
    router.back()
  }
  return (
    <Button onClick={getBack} variant="ghost" size={'icon'}>
      <ArrowLeft className="w-5 h-5" />
    </Button>
  )
}
