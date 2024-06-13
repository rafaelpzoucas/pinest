import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Pinest | Dashboard',
  description: 'Painel administrativo, visualize e gerencie sua loja.',
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
