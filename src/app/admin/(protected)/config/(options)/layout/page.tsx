import { AdminHeader } from '@/components/admin-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { BenefitsSection } from './benefits-section'

export default function Layout() {
  return (
    <div className="space-y-4 lg:px-0">
      <AdminHeader title="Organização da loja" />

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vitrines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Novidades</CardTitle>
                <CardDescription>
                  Últimos 10 produtos cadastrados.
                </CardDescription>
                <Switch className="absolute top-4 right-4" />
              </CardHeader>
            </Card>
            <Card className="relative">
              <CardHeader>
                <CardTitle>Mais vendidos</CardTitle>
                <CardDescription>
                  Os 10 produtos mais vendidos da sua loja.
                </CardDescription>
                <Switch className="absolute top-4 right-4" />
              </CardHeader>
            </Card>
          </CardContent>
        </Card>

        <BenefitsSection />
      </section>
    </div>
  )
}
