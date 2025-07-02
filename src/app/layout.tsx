import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const runtime = 'edge'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <TooltipProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TooltipProvider>

        <Toaster />

        <SpeedInsights />
      </body>
    </html>
  )
}
