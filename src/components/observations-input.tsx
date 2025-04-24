'use client'

import {
  insertObservation,
  readObservations,
} from '@/app/admin/(protected)/(app)/purchases/actions'
import { Label } from '@/components/ui/label'
import { ObservationType } from '@/models/observation'
import { Check, ChevronsUpDown, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ObservationsInputProps {
  value: string[]
  onChange: (newObservations: string[]) => void
  label?: string
}

export function ObservationsInput({
  value,
  onChange,
  label = 'Observações',
}: ObservationsInputProps) {
  const [observations, setObservations] = useState<ObservationType[]>([])
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const { execute: executeInsert } = useServerAction(insertObservation, {
    onSuccess: () => {
      executeRead()
    },
  })

  const { execute: executeRead, data: observationsData } = useServerAction(
    readObservations,
    {
      onSuccess: () => {
        if (observationsData?.observations) {
          setObservations(observationsData?.observations)
        }
      },
    },
  )

  const handleAddObservation = async (newObservation: string) => {
    const trimmed = newObservation.trim()
    if (!trimmed) return

    // Adiciona a observação no Supabase
    executeInsert({ observation: trimmed })

    // Atualiza o estado local após sucesso
    onChange([...value, trimmed])
    setInputValue('')
  }

  const handleRemove = (index: number) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  useEffect(() => {
    executeRead()
  }, [onChange])

  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>

      <ul className="space-y-1">
        {value.length > 0 &&
          value.map((obs, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-muted px-2 py-1 rounded-lg text-xs
                uppercase"
            >
              <span>*{obs}</span>
              <button type="button" onClick={() => handleRemove(index)}>
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          ))}
      </ul>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            Selecione observações...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput
              value={inputValue}
              placeholder="Digite e aperte Enter..."
              onValueChange={setInputValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const filtered = observations.filter((obs) =>
                    obs.observation
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()),
                  )

                  if (filtered.length === 0) {
                    handleAddObservation(inputValue) // Cria nova
                  } else {
                    const firstMatch = filtered[0].observation
                    setInputValue(firstMatch)
                    if (!value.includes(firstMatch)) {
                      onChange([...value, firstMatch])
                    }
                    setInputValue('')
                    setOpen(false)
                  }
                }
              }}
            />
            <CommandList>
              <CommandEmpty>Aperte Enter para criar.</CommandEmpty>
              <CommandGroup>
                {observations.map((observation) => (
                  <CommandItem
                    key={observation.id}
                    value={observation.observation}
                    onSelect={(currentValue) => {
                      handleAddObservation(currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        inputValue === observation.observation
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {observation.observation}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
