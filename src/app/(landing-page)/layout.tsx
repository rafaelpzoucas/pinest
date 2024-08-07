import { ReactNode } from 'react'
import { Header } from './header'

export default function LandingPageLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div>
      <Header />

      {children}
    </div>
  )
}
