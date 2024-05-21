import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductsStep } from './products'
import { SearchZipCode } from './profile/search-zip-code'
import { ProfileStep } from './profile/steps'
import { WelcomeStep } from './welcome'

export default async function Onboarding({
  searchParams,
}: {
  searchParams: { step: string }
}) {
  const supabase = createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    redirect('/admin/sign-in')
  }

  return (
    <main className="h-dvh p-6">
      {!searchParams?.step && <WelcomeStep />}
      {searchParams?.step === 'profile' && <ProfileStep />}
      {searchParams?.step === 'search-zc' && <SearchZipCode />}
      {searchParams?.step === 'products' && <ProductsStep />}
    </main>
  )
}
