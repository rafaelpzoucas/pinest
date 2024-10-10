import { ScrollArea } from '@/components/ui/scroll-area'
import type { Metadata } from 'next'
import { Navigation } from './navigation/index'

export const metadata: Metadata = {
  title: 'Pinest | Admin',
  description:
    'Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!',
}

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="md:flex flex-row">
      <Navigation />

      <ScrollArea className="w-full h-[calc(100vh_-_73px)] lg:px-5">
        <main className="flex flex-col items-center w-full">
          <div className="w-full max-w-7xl pb-16">{children}</div>
        </main>
      </ScrollArea>
    </main>
  )
}
