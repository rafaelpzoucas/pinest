import { LucideIcon } from 'lucide-react'

type SubLinkType = {
  icon: LucideIcon
  title: string
  route: string
}

export type LinkType = {
  title: string
  icon: LucideIcon
  route: string
  subLinks?: SubLinkType[]
  variant?: 'default' | 'ghost'
}
