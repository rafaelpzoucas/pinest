import { AdminHeader } from '@/components/admin-header'
import { BenefitsSection } from './benefits/section'
import { ShowcasesSection } from './showcases/section'

export default function Layout() {
  return (
    <div className="space-y-4 lg:px-0">
      <AdminHeader title="Organização da loja" />

      <section className="space-y-6">
        <ShowcasesSection />

        <BenefitsSection />
      </section>
    </div>
  )
}
