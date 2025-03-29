import { SocialsForm } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/socials/form'

export default function StoreBasicInformations() {
  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Redes sociais</h1>

      <SocialsForm />
    </div>
  )
}
