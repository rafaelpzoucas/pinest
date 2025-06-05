'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Printer, Trash } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { deletePrinter, printReceipt } from './actions'
import { PrinterType } from './schemas'

export function PrinterCard({ printer }: { printer: PrinterType }) {
  const { execute: executeDelete, isPending: isDeleting } =
    useServerAction(deletePrinter)
  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printReceipt)

  return (
    <Card className="flex flex-row justify-between items-center pr-6">
      <CardHeader>
        <CardTitle>{printer.nickname}</CardTitle>
        <CardDescription>{printer.name}</CardDescription>
      </CardHeader>

      <div className="space-x-3">
        <Button
          variant="secondary"
          onClick={() =>
            executePrintReceipt({ printerName: printer.name, text: 'Teste' })
          }
          disabled={isPrinting}
        >
          {isPrinting ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Imprimindo...</span>
            </>
          ) : (
            <>
              <Printer />
              <span>Imprimir teste</span>
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => executeDelete(printer)}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash />}
        </Button>
      </div>
    </Card>
  )
}
