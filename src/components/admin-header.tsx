'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Card } from './ui/card'

type HeaderPropsType = {
  title?: string
  withBackButton?: boolean
}

export function AdminHeader({ title, withBackButton }: HeaderPropsType) {
  const router = useRouter()

  function getBack() {
    router.back()
  }

  return (
    <header className="flex items-center justify-center w-full">
      <Card className="flex flex-row items-center gap-2 w-full h-[68px] p-2 lg:p-4 bg-secondary/50 border-0">
        {withBackButton && (
          <Button onClick={getBack} variant="ghost" size={'icon'}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <h1 className="font-bold ml-3">{title}</h1>
      </Card>
    </header>
  )
}
