import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { AddressType } from '@/models/user'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type QueryParamsGeneric = { [key: string]: string | number | null | undefined }

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

export function formatDistanceToNowDate(date: string) {
  return formatDistanceToNow(new Date(date), {
    locale: ptBR,
  })
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export function queryParamsLink(params: any | null) {
  const queryParams = new URLSearchParams()

  if (params) {
    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }

  return queryParams.toString()
}

export function formatAddress(address: AddressType) {
  return `${address.street}, ${address.number}${address.complement ? ', ' + address.complement : ''} - ${address.neighborhood} - ${address.city}/${address.state}`
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function convertStringToNumber(string: string) {
  if (string === '') {
    return
  }

  if (typeof string === 'string') {
    let numberString = string.replace(/[^0-9,.-]+/g, '')

    if (numberString.includes(',')) {
      numberString = numberString.replace(',', '.')
    }

    const number = parseFloat(numberString)

    return number
  }

  return null
}

export function generateSlug(str: string) {
  return removeAccents(str).toLowerCase().replace(' ', '-')
}
