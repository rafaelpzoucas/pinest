'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ExtrasInputProps {
  availableExtras: ExtraType[]
  value: {
    name: string
    price: number
    extra_id: string
    quantity: number
  }[]
  onChange: (extras: ExtrasInputProps['value']) => void
}

export function ExtrasInput({
  availableExtras,
  value,
  onChange,
}: ExtrasInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftExtras, setDraftExtras] = useState<Record<string, number>>({})

  const handleChange = (extraId: string, delta: number) => {
    setDraftExtras((prev) => {
      const current = prev[extraId] || 0
      const newQuantity = current + delta
      if (newQuantity <= 0) {
        const { [extraId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [extraId]: newQuantity }
    })
  }

  const handleSave = () => {
    const newExtras = Object.entries(draftExtras).map(([id, quantity]) => {
      const extra = availableExtras.find((e) => e.id === id)!
      return {
        name: extra.name,
        price: extra.price * quantity,
        extra_id: extra.id,
        quantity,
      }
    })
    onChange([...value, ...newExtras])
    setDraftExtras({})
    setIsOpen(false)
  }

  const handleRemove = (index: number) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && <Label className="text-sm">Adicionais</Label>}

      <ul className="space-y-1">
        {value.length > 0 &&
          value.map((extra, index) => (
            <li
              key={index}
              className="flex items-center bg-muted px-2 py-1 rounded-lg text-sm uppercase"
            >
              <span>{extra.quantity} ad.</span>
              {extra.name}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex flex-row items-center gap-2 ml-auto"
              >
                <span>{formatCurrencyBRL(extra.price)}</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
      </ul>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="link" className="p-0">
            <Plus className="w-4 h-4" /> Adicionais
          </Button>
        </SheetTrigger>
        <SheetContent className="px-0">
          <SheetHeader className="px-6">
            <SheetTitle>Selecionar adicionais</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh_-_124px)] px-6">
            <div className="space-y-3 mt-4">
              {availableExtras.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span>{extra.name}</span>
                    <strong className="text-xs text-muted-foreground">
                      {formatCurrencyBRL(extra.price)}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => handleChange(extra.id, -1)}
                      disabled={!draftExtras[extra.id]}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center text-xs">
                      {draftExtras[extra.id] || 0}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => handleChange(extra.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <SheetFooter className="px-6">
            <Button className="mt-4 w-full" onClick={handleSave}>
              Salvar Adicionais
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
