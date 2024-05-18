import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(number: number) {
  return Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number)
}

export function formatDate(date: string, dateFormat: string) {
  return format(new Date(date), dateFormat, {
    locale: ptBR,
  })
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
