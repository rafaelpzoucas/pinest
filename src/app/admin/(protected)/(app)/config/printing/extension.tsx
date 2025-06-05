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
    onSuccess: () => {
      setIsExtensionActive(true)
    },
    onError: () => {
      setIsExtensionActive(false)
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      execute()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

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
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Baixar extensão
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
