'use client'

import { getRootPath } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from './ui/button'

export function BackButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  const storeSubdomain = params.public_store as unknown as string

  const qBack = searchParams.get('back')

  function getBack() {
    if (qBack && qBack === 'home') {
      const rootPath = getRootPath(storeSubdomain)
      router.push(`/${rootPath}`)
    }
    router.back()
  }

  return (
    <Button onClick={getBack} variant="ghost" size={'icon'}>
      <ArrowLeft className="w-5 h-5" />
    </Button>
  )
}
