import IfoodHandshakeDisputeSchema from '@/app/api/v1/integrations/ifood/webhook/schemas'
import { StoreStatus } from '@/app/store-status'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarProvider } from '@/components/ui/sidebar'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { readLastEvents } from './actions'
import { IfoodHandshakePlatform } from './ifood-handshake-platform'
import { MobileNavigation } from './navigation'
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
  const [data] = await readLastEvents()

  const events: z.infer<typeof IfoodHandshakeDisputeSchema>[] =
    (data && data.events && data.events) ?? []

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <MobileNavigation />

      <main className="md:flex flex-row w-full">
        <SoundNotification />

        {/* <div className="p-1 hidden lg:flex">
          <SidebarTrigger className="w-9 h-9" />
        </div> */}

        <ScrollArea className="w-full h-dvh lg:px-5 print:p-0">
          <main className="flex flex-col items-center w-full">
            <div className="w-full max-w-7xl pb-16">{children}</div>
          </main>
        </ScrollArea>

        {events.length > 0 &&
          events.map((event) => <IfoodHandshakePlatform event={event} />)}
        <StoreStatus storeUrl={params.public_store} />
      </main>
    </SidebarProvider>
  )
}
