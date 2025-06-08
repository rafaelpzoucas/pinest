'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Edit, Loader2, Printer, Trash } from 'lucide-react'
import { useState } from 'react'
import { useServerAction } from 'zsa-react'
import { deletePrinter, printPurchaseReceipt } from './actions'
import { NewPrinterForm } from './new-printer-form'
import { PrinterType } from './schemas'

const PRINTER_SECTORS_MAP = {
  kitchen: 'Cozinha',
  delivery: 'Entrega',
} as const

type SectorKey = keyof typeof PRINTER_SECTORS_MAP

export function PrinterCard({ printer }: { printer: PrinterType }) {
  const [isOpen, setIsOpen] = useState(false)

  const { execute: executeDelete, isPending: isDeleting } =
    useServerAction(deletePrinter)
  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printPurchaseReceipt)

  return (
    <Card className="flex flex-row justify-between items-center pr-6">
      <CardHeader>
        <CardTitle>{printer.nickname}</CardTitle>
        <CardDescription>{printer.name}</CardDescription>

        <div
          className="flex flex-row gap-1"
          hidden={printer.sectors.length === 0}
        >
          {printer.sectors.map((sector) => (
            <Badge key={sector} variant="outline">
              {PRINTER_SECTORS_MAP[sector as SectorKey]}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <div className="space-x-3">
        <Button
          variant="secondary"
          onClick={() => executePrintReceipt({ printerName: printer.name })}
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
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon">
              <Edit />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nova impressora</SheetTitle>
            </SheetHeader>

            <NewPrinterForm setSheetState={setIsOpen} printer={printer} />
          </SheetContent>
        </Sheet>
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
