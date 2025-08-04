'use client'

import { ObservationType } from '@/models/observation'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  NotepadText,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { createAdminObservation } from '@/actions/admin/observations/actions'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ObservationsInputProps {
  value: string[]
  onChange: (newObservations: string[]) => void
  observations?: ObservationType[]
  isLoading?: boolean
  storeId?: string
}

export function ObservationsInput({
  value,
  onChange,
  observations,
  isLoading,
  storeId,
}: ObservationsInputProps) {
  const queryClient = useQueryClient()

  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const { mutate: createObservation } = useMutation({
    mutationFn: createAdminObservation,
    onSuccess: ({ createdObservation }) => {
      const newObservation = createdObservation

      queryClient.setQueryData<ObservationType[]>(['observations'], (old) =>
        old ? [...old, newObservation] : [newObservation],
      )

      toast.error('Nova observação criada com sucesso!')
    },
    onError: ({ message }) => {
      console.error('Não foi possível criar a observação.', message)
      toast.error('Não foi possível criar a observação.')
    },
  })

  const handleAddObservation = async (newObservation: string) => {
    const trimmed = newObservation.trim()
    if (!trimmed) return

    // Atualiza o estado local após sucesso
    onChange([...value, trimmed])
    setInputValue('')

    const observationExists = observations?.some(
      (obs) => obs.observation.toLowerCase() === trimmed.toLowerCase(),
    )

    if (!observationExists) {
      createObservation({ storeId, observation: trimmed })
    }
  }

  const handleRemove = (index: number) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full"
          >
            <NotepadText />
            Observações
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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
                  const filtered = observations
                    ? observations.filter((obs) =>
                        obs.observation
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()),
                      )
                    : []

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
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <Loader2 className="animate-spin" />
                    <span>Carregando observações...</span>
                  </div>
                ) : (
                  'Nenhum produto encontrado.'
                )}
              </CommandEmpty>
              <CommandGroup>
                {!!observations &&
                  observations.map((observation) => (
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
    </div>
  )
}
