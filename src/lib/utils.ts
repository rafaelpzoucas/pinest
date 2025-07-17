import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { addressSchema } from '@/app/[public_store]/account/register/schemas'
import { AddressType } from '@/models/address'
import { format, formatDistance, formatDistanceToNow, isFuture } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { z } from 'zod'

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

export function formatDistanceToFuture(dataFutura: Date): string {
  const hoje = new Date()

  // Verifica se a data é futura e calcula a distância
  const distancia = formatDistance(dataFutura, hoje, {
    locale: ptBR, // Localização em português
    addSuffix: false, // Não adiciona o "em" automático do date-fns
  })

  return isFuture(dataFutura) ? `em até ${distancia}` : `há ${distancia}`
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

export function formatAddress(
  address: AddressType | z.infer<typeof addressSchema> | null | undefined,
): string | null {
  if (!address) return null

  const { street, number, complement, neighborhood } = address

  const parts = [
    `${street}, ${number}`,
    complement,
    neighborhood ? `- ${neighborhood}` : null,
  ]

  return parts.filter(Boolean).join(' ')
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function normalizeString(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim() // Remove espaços no início e no final
}

export function stringToNumber(string?: string) {
  if (string === '' || !string) {
    return 0
  }

  if (typeof string === 'string') {
    // Remove todos os caracteres que não são dígitos, vírgulas ou pontos.
    let numberString = string.replace(/[^0-9,.-]+/g, '')

    // Se a string contiver uma vírgula e ponto, remover os pontos (separadores de milhar).
    if (numberString.includes('.') && numberString.includes(',')) {
      numberString = numberString.replace(/\./g, '')
    }

    // Substitui a última vírgula pelo ponto decimal.
    numberString = numberString.replace(',', '.')

    const number = parseFloat(numberString)

    return number
  }

  return 0
}

export function generateSlug(str: string): string {
  return normalizeString(str).replace(/\s+/g, '') // Substitui espaços por hífens
}

export const dayTranslation: Record<string, string> = {
  monday: 'segunda',
  tuesday: 'terça',
  wednesday: 'quarta',
  thursday: 'quinta',
  friday: 'sexta',
  saturday: 'sábado',
  sunday: 'domingo',
}

export async function isSameCity(cep1: string, cep2: string) {
  const fetchCep = async (cep: string) => {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

    if (!res.ok) {
      throw new Error(
        `Erro ao buscar o CEP ${cep}: ${res.status} ${res.statusText}`,
      )
    }

    const data = await res.json()
    if (data.erro) {
      throw new Error(`CEP ${cep} não encontrado.`)
    }

    return data
  }

  try {
    const [dadosCep1, dadosCep2] = await Promise.all([
      fetchCep(cep1),
      fetchCep(cep2),
    ])

    return (
      dadosCep1.localidade === dadosCep2.localidade &&
      dadosCep1.uf === dadosCep2.uf
    )
  } catch (error) {
    console.error(error)
    return false
  }
}

const isStagingEnvironment = () => {
  if (typeof window !== 'undefined') {
    return ['staging.pinest.com.br', 'staging-pinest.vercel.app'].includes(
      window.location.hostname,
    )
  }

  // Detecção no servidor - melhorada
  const hostname =
    process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || ''
  const isStaging =
    hostname.includes('staging') ||
    hostname.includes('staging-pinest') ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_GIT_COMMIT_REF === 'staging'

  return isStaging
}

export const getRootPath = (storeSubdomain: string | undefined | null) => {
  if (!storeSubdomain) return ''

  const isLocalhost =
    typeof window !== 'undefined'
      ? window.location.hostname.startsWith('localhost')
      : process.env.NODE_ENV === 'development'

  const isStaging = isStagingEnvironment()

  if (isLocalhost || isStaging) {
    return `${storeSubdomain}`
  }

  return '' // produção usa reescrita, não precisa prefixar
}

export const createPath = (
  path: string,
  storeSubdomain: string | undefined | null,
) => {
  const rootPath = getRootPath(storeSubdomain)
  if (!rootPath) return path
  return `/${rootPath}${path}`
}
