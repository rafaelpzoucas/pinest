import { BenefitsSection } from './benefits-section'
import { HeroSection } from './hero-section'
import { PreSaleSection } from './pre-sale-section'
import { ResourcesSection } from './resources-section'
import { USPSection } from './usp-section'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <USPSection />
      <ResourcesSection />
      <BenefitsSection />
      {/* <PricingSection /> */}
      <PreSaleSection />
      {/* Social proof - números, logotipos e historias de clientes */}
      {/* FAQ */}
    </main>
  )
}
