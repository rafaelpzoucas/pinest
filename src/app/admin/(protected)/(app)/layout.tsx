import { StoreStatus } from '@/app/store-status'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Metadata } from 'next'
import { Navigation } from './navigation/index'
import { SoundNotification } from './sound-notification'

export const metadata: Metadata = {
  title: 'Pinest | Admin',
  description:
    'Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!',
}

export default async function ProtectedLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: {
    public_store: string
  }
}>) {
  return (
    <main className="md:flex flex-row">
      <Navigation />

      <SoundNotification />

      <ScrollArea className="w-full h-dvh lg:px-5 print:p-0">
        <main className="flex flex-col items-center w-full">
          <div className="w-full max-w-7xl pb-16">{children}</div>
        </main>
      </ScrollArea>

      <StoreStatus storeUrl={params.public_store} />
    </main>
  )
}
