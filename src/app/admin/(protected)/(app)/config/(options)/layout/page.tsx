import { AdminHeader } from '@/app/admin-header'
import { readStoreCached } from './actions'
import { AppearenceForm } from './appearence'
import { BenefitsSection } from './benefits/section'
import { Hours } from './hours'
import { ShowcasesSection } from './showcases/section'
import { Socials } from './socials'
import { Store } from './store'

export default async function Layout() {
  const [storeData] = await readStoreCached()

  const store = storeData?.store

  return (
    <div className="space-y-4 pb-16 lg:px-0">
      <AdminHeader title="Organização da loja" />

      <section className="space-y-6">
        <Store store={store} />
        <AppearenceForm store={store} />

        <ShowcasesSection />
        <BenefitsSection />

        <Socials store={store} />
        <Hours store={store} />
      </section>
    </div>
  )
}
