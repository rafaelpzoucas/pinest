'use client'

import { format, subDays } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

export function DatePicker() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const qStartDate = searchParams.get('start_date')
  const defaultStartDate = qStartDate ? new Date(qStartDate) : new Date()

  const [date, setDate] = React.useState<Date | undefined>(defaultStartDate)

  React.useEffect(() => {
    if (date) {
      router.push(`?start_date=${date.toISOString()}`)
    }
  }, [date])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {date ? (
            format(date, 'PPP', { locale: ptBR })
          ) : (
            <span>Selecione uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2">
          <Select
            onValueChange={(value) =>
              setDate(subDays(new Date(), parseInt(value)))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="0">Hoje</SelectItem>
              <SelectItem value="1">Ontem</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
