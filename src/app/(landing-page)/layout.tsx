import { ThemeProvider } from '@/components/theme-provider'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Header } from './header'

export const metadata: Metadata = {
  title: 'Pinest',
  description:
    'Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!',
}

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

        <div className="w-full py-2 bg-secondary/50">
          <p className="text-sm text-center text-muted-foreground">
            &copy; 2024 Pinest. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </ThemeProvider>
  )
}
