import IfoodHandshakeDisputeSchema from '@/app/api/v1/integrations/ifood/webhook/schemas'
import { StoreStatus } from '@/app/store-status'
import { SubscriptionPlans } from '@/components/subscription-plans'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Metadata } from 'next'
import { z } from 'zod'
import { readLastEvents, readStoreSubscriptionStatus } from './actions'
import { IfoodHandshakePlatform } from './ifood-handshake-platform'
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
  const [data] = await readLastEvents()
  const [subscription] = await readStoreSubscriptionStatus()

  const events: z.infer<typeof IfoodHandshakeDisputeSchema>[] =
    (data && data.events && data.events) ?? []

  const isSubscriptionActive = subscription?.subscriptionStatus === 'active'

  return (
    <main className="md:flex flex-row">
      <Navigation />

      <SoundNotification />

      <ScrollArea className="w-full h-dvh lg:px-5 print:p-0">
        <main className="flex flex-col items-center w-full">
          <div className="w-full max-w-7xl pb-16">
            {isSubscriptionActive ? children : <SubscriptionPlans />}
          </div>
        </main>
      </ScrollArea>

      {events.length > 0 &&
        events.map((event) => <IfoodHandshakePlatform event={event} />)}
      <StoreStatus storeUrl={params.public_store} />
    </main>
  )
}
