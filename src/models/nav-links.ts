import { LucideIcon } from 'lucide-react'

type SubLinkType = {
  title: string
  route?: string
}

export type LinkType = {
  title: string
  icon: LucideIcon
  route: string
  subLinks?: SubLinkType[]
  variant?: 'default' | 'ghost'
}
