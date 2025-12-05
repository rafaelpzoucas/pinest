import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Pinest | Sign in',
  description:
    'Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!',
}

export default function SignInLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
