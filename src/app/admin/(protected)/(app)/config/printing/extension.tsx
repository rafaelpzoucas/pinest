'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { checkPrinterExtension } from './actions'

export function Extension() {
  const [isExtensionActive, setIsExtensionActive] = useState(false)

  const { execute } = useServerAction(checkPrinterExtension, {
    onSuccess: ({ data }) => {
      setIsExtensionActive(data.success)
    },
    onError: () => {
      setIsExtensionActive(false)
    },
  })

  useEffect(() => {
    let isMounted = true
    let isExecuting = false

    const check = async () => {
      if (isExecuting) return
      isExecuting = true
      try {
        await execute()
      } finally {
        isExecuting = false
      }
    }

    check() // chamada inicial

    const interval = setInterval(() => {
      if (isMounted) check()
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [execute])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extensão da impressora</CardTitle>
        <CardDescription>
          Baixe e mantenha sempre a extensão aberta para usar a impressora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isExtensionActive ? (
          <div className="flex flex-row items-center gap-4">
            <Badge className="bg-emerald-500 hover:bg-emerald-500">
              Extensão aberta
            </Badge>
            <span className="text-xs text-muted-foreground">
              Informação atualizada a cada 30 segundos
            </span>
          </div>
        ) : (
          <Button asChild variant="secondary">
            <a href="/PinestPrinter_Setup.exe" download>
              <Download className="w-4 h-4" />
              Baixar extensão
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
