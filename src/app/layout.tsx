import { ThemeProvider } from '@/components/theme-provider'
import { buttonVariants } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pinest',
  description:
    'Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <footer className="w-full bg-secondary p-8">
              <div className="container">
                <ul>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className={cn(
                        buttonVariants({ variant: 'link' }),
                        'text-sm',
                      )}
                    >
                      Política de privacidade
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/service-terms"
                      className={cn(
                        buttonVariants({ variant: 'link' }),
                        'text-sm',
                      )}
                    >
                      Termos de serviço
                    </Link>
                  </li>
                </ul>
              </div>
            </footer>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
