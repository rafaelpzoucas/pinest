import { ThemeProvider } from '@/components/theme-provider'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Header } from './header'

export default function LandingPageLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ThemeProvider
      storageKey="lp-theme"
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div>
        <Header />

        {children}

        <footer className="w-full bg-secondary p-8">
          <div className="container">
            <ul>
              <li>
                <Link
                  href="/privacy-policy"
                  className={cn(buttonVariants({ variant: 'link' }), 'text-sm')}
                >
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/service-terms"
                  className={cn(buttonVariants({ variant: 'link' }), 'text-sm')}
                >
                  Termos de serviço
                </Link>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
