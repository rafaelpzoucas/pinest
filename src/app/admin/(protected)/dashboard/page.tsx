import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { fetchUser } from '../store/(store-options)/profile/actions/read-data'
import { FirstSteps } from './first-steps'

export default async function DashboardPage() {
  const { users } = await fetchUser()

  const store = users && users[0]

  const address = `${store?.user_addresses[0].street}, ${store?.user_addresses[0].number}`

  return (
    <main className="space-y-6 p-4">
      <Link href="store/profile">
        <Card>
          <CardContent className="flex flex-row gap-4 pt-6">
            <div className="flex flex-col gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <div>
                <strong className="text-lg capitalize">{store?.name}</strong>
                <div>
                  <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{store?.phone}</span>
                  </span>
                  <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{address}</span>
                  </span>
                </div>
              </div>
            </div>

            <ChevronRight className="ml-auto w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <FirstSteps />

      <Card>
        <CardHeader>
          <CardTitle>Resumo de hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-muted-foreground">Total de pedidos</span>
            <strong>0</strong>
          </div>
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-muted-foreground">Faturamento total</span>
            <strong>R$ 0,00</strong>
          </div>
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-muted-foreground">Ticket Médio</span>
            <strong>R$ 0,00</strong>
          </div>
          <Button className="w-full mt-4">Ver relatórios</Button>
        </CardContent>
      </Card>
    </main>
  )
}
