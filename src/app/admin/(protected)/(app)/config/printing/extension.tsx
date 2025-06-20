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

export function Extension({ storeId }: { storeId?: string }) {
  const [isExtensionActive, setIsExtensionActive] = useState(false)

  const { execute } = useServerAction(checkPrinterExtension, {
    onSuccess: ({ data }) => {
      setIsExtensionActive(data.success)
    },
    onError: () => {
      setIsExtensionActive(false)
    },
  })

  const handleDownload = async () => {
    console.log({ storeId })
    try {
      const response = await fetch(
        `/api/v1/admin/print/installer?storeId=${storeId}`,
      )
      if (!response.ok) throw new Error('Erro ao baixar instalador')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'PinestPrinter_Setup.exe'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao baixar o instalador. Tente novamente.')
    }
  }

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
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Baixar extensão
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
