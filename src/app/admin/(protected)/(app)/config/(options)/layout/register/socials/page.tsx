import { AdminHeader } from '@/app/admin-header'
import { readStoreByUserId, readStoreSocials } from '../../../account/actions'
import { SocialsForm } from './form'

export default async function ProfileRegister() {
  const { store } = await readStoreByUserId()

  if (!store) {
    return null
  }

  const { socials, readSocialsError } = await readStoreSocials(store.store_url)

  if (readSocialsError) {
    console.error(readSocialsError)
  }

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Redes sociais" withBackButton />

      <SocialsForm storeSocials={socials} />
    </section>
  )
}
