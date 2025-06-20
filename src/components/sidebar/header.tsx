'use client'

import { cn } from '@/lib/utils'
import { StoreType } from '@/models/store'
import Image from 'next/image'
import { SidebarHeader, useSidebar } from '../ui/sidebar'
import { StoreStatus } from './store-status'

export function Header({ store }: { store?: StoreType }) {
  const { state } = useSidebar()

  const isCollapsed = state === 'collapsed'

  return (
    <SidebarHeader>
      <div
        className="flex items-center justify-center p-3 data-[collapsed=true]:p-1"
        data-collapsed={isCollapsed}
      >
        <div className="data-[hidden=true]:hidden" data-hidden={isCollapsed}>
          <Image
            src="/logo-dark.svg"
            alt="Pinest logo"
            width={100}
            height={50}
            className="hidden dark:block"
          />
          <Image
            src="/logo-light.svg"
            alt="Pinest logo"
            width={100}
            height={50}
            className="dark:hidden"
          />
        </div>
        <Image
          src="/icon-dark.svg"
          alt="Pinest logo"
          width={25}
          height={25}
          className={cn('hidden', isCollapsed && 'block')}
        />
      </div>

      <StoreStatus store={store} />
    </SidebarHeader>
  )
}
