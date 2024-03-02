import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, MapPin, Phone } from 'lucide-react'
import { FirstSteps } from './first-steps'

export default function DashboardPage() {
  return (
    <main className="space-y-6 p-4">
      <Card>
        <CardContent className="flex flex-row gap-4 pt-6">
          <div className="flex flex-col gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <strong className="text-lg">Cantinho do Hot Dog</strong>
              <div>
                <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>(18) 99999-9999</span>
                </span>
                <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Rua 15 de Novembro, 123</span>
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="ml-auto w-4 h-4 text-muted-foreground" />
        </CardContent>
      </Card>

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
