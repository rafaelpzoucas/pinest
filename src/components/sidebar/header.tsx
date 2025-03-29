import { StoreType } from '@/models/store'
import Image from 'next/image'
import { SidebarHeader } from '../ui/sidebar'
import { StoreStatus } from './store-status'

export function Header({ store }: { store: StoreType }) {
  return (
    <SidebarHeader>
      <div className="flex items-center justify-center p-3">
        <Image
          src="/logo-dark.svg"
          alt="Pinest logo"
          width={100}
          height={50}
          className="light:hidden"
        />
        <Image
          src="/logo-light.svg"
          alt="Pinest logo"
          width={100}
          height={50}
          className="dark:hidden"
        />
      </div>

      <StoreStatus store={store} />
    </SidebarHeader>
  )
}
