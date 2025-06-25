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
import { usePrinterExtensionStore } from '@/stores/printerExtensionStore'
import { Download } from 'lucide-react'

export function Extension() {
  const { isActive } = usePrinterExtensionStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extensão da impressora</CardTitle>
        <CardDescription>
          Baixe e mantenha sempre a extensão aberta para usar a impressora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div className="flex flex-row items-center gap-4">
            <Badge className="bg-emerald-500 hover:bg-emerald-500">
              Extensão aberta
            </Badge>
            <span className="text-xs text-muted-foreground">
              Informação atualizada a cada 30 segundos
            </span>
          </div>
        ) : (
          <Button variant="secondary" asChild>
            <a
              href="https://drive.google.com/uc?export=download&id=1jSmBm14-QBPPb37rFvwLIAyEffBptXpu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
              Baixar extensão
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
