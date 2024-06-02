import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FirstSteps } from './first-steps'
import { ProfileCard } from './profile'

export default async function DashboardPage() {
  return (
    <main className="space-y-6 p-4">
      <ProfileCard />

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
