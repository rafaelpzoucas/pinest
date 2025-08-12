import { SubscriptionPlans } from '@/components/subscription-plans'
import { BenefitsSection } from './benefits-section'
import { HeroSection } from './hero-section'
import { ResourcesSection } from './resources-section'
import { USPSection } from './usp-section'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <USPSection />
      <ResourcesSection />
      <BenefitsSection />
      <div className="py-16 p-8">
        <SubscriptionPlans />
      </div>
      {/* Social proof - números, logotipos e historias de clientes */}
      {/* FAQ */}
    </main>
  )
}
