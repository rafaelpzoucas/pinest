"use client";

import * as React from "react";
import { format, isSameDay, isToday, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerWithRangeProps = {
  /**
   * Range padrão caso não exista start_date / end_date na URL
   */
  defaultRange?: DateRange;

  /**
   * Callback opcional quando o range muda
   */
  onChange?: (range: DateRange | undefined) => void;
} & React.HTMLAttributes<HTMLDivElement>;

function parseDate(value: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getDateRangeLabel(range?: DateRange) {
  if (!range?.from) return "Selecione uma data";

  const { from, to } = range;

  // Caso não exista "to"
  if (!to) {
    return isToday(from) ? "Hoje" : format(from, "LLL dd, y");
  }

  // Mesmo dia
  if (isSameDay(from, to)) {
    return isToday(from) ? "Hoje" : format(from, "LLL dd, y");
  }

  // Range normal
  const fromLabel = isToday(from) ? "Hoje" : format(from, "LLL dd, y");
  const toLabel = isToday(to) ? "Hoje" : format(to, "LLL dd, y");

  return `${fromLabel} - ${toLabel}`;
}

export function DatePickerWithRange({
  className,
  defaultRange = {
    from: subDays(new Date(), 7),
    to: new Date(),
  },
  onChange,
}: DatePickerWithRangeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startParam = searchParams.get("start_date");
  const endParam = searchParams.get("end_date");

  /**
   * Resolve o range inicial:
   * 1. Primeiro tenta usar query params
   * 2. Se não existir, usa o defaultRange vindo via props
   */
  const initialRange = React.useMemo<DateRange | undefined>(() => {
    const from = parseDate(startParam);
    const to = parseDate(endParam);

    if (from || to) {
      return {
        from: from ?? defaultRange.from,
        to: to ?? defaultRange.to,
      };
    }

    return defaultRange;
  }, [startParam, endParam, defaultRange]);

  const [date, setDate] = React.useState<DateRange | undefined>(initialRange);

  // 🔁 Sincroniza o defaultRange com o state quando não existe filtro na URL
  React.useEffect(() => {
    const hasQueryRange = startParam || endParam;
    if (hasQueryRange) return;

    setDate(defaultRange);
  }, [defaultRange, startParam, endParam]);

  /**
   * Mantém a URL sincronizada com o range selecionado
   */
  React.useEffect(() => {
    if (!date?.from) return;

    const params = new URLSearchParams(searchParams.toString());

    params.set("start_date", date.from.toISOString());

    if (date.to) {
      params.set("end_date", date.to.toISOString());
    } else {
      params.delete("end_date");
    }

    router.push(`?${params.toString()}`, { scroll: false });

    onChange?.(date);
  }, [date, router, searchParams, onChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-fit justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{getDateRangeLabel(date)}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
