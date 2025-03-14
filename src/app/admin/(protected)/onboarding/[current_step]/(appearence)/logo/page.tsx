import { AppearenceForm } from '@/app/admin/(protected)/(app)/config/(options)/account/appearence'
import { LogoAvatar } from '@/app/admin/(protected)/(app)/config/(options)/account/register/store/logo-avatar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { readStore } from '../../../actions'

export default async function AddLogo() {
  const { store } = await readStore()

  return (
    <div className="flex flex-col justify-center items-center gap-8 pb-16">
      <h1 className="text-3xl font-bold text-center">Adicione o seu logo</h1>

      <LogoAvatar store={store} />

      <AppearenceForm store={store} />

      <Link
        href="/admin/onboarding/shipping/own"
        className={cn(buttonVariants(), 'w-fit')}
      >
        Próximo
      </Link>
    </div>
  )
}
