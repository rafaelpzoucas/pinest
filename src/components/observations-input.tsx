'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

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
  const [inputValue, setInputValue] = useState('')

  const handleAddObservation = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setInputValue('')
  }

  const handleRemove = (index: number) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <ul className="space-y-1">
        {value.length > 0 &&
          value.map((obs, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-muted px-2 py-1 rounded-lg text-sm
                uppercase"
            >
              <span>*{obs}</span>
              <button type="button" onClick={() => handleRemove(index)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
      </ul>
      <Input
        value={inputValue}
        placeholder="Digite e aperte Enter..."
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleAddObservation()
          }
        }}
      />
    </div>
  )
}
