import { DefaultLogo } from '@/components/default-logo'
import Image from 'next/image'
import { readStoreByName } from './actions'
import { Menu } from './menu'

export default async function Header({
  params,
}: {
  params: { public_store: string }
}) {
  const { store, storeError } = await readStoreByName(
    params.public_store.replaceAll('-', ' '),
  )

  if (storeError) {
    console.error(storeError)
  }

  return (
    <div className="p-2">
      <header className="relative p-4 py-4 bg-primary/80 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="relative w-full h-8 max-w-64">
            {store && store.logo_url ? (
              <Image
                src={store.logo_url}
                fill
                alt=""
                className={'object-contain object-left'}
                priority
              />
            ) : (
              <DefaultLogo storeName={store?.name} />
            )}
          </div>

          <div className="flex flex-row gap-2">
            <Menu />
          </div>
        </div>
      </header>
    </div>
  )
}
