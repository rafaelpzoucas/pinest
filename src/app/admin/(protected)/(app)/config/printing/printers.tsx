'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NewPrinter } from './new-printer'
import { PrinterCard } from './printer-card'
import { PrinterType } from './schemas'

export function Printers({ printers }: { printers?: PrinterType[] }) {
  if (!printers) {
    return null
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Minhas impressoras</CardTitle>
          <CardDescription>
            Selecione e configure suas impressoras
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <NewPrinter />

          {printers.length > 0 &&
            printers.map((printer) => (
              <PrinterCard key={printer.id} printer={printer} />
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
