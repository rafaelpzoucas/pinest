'use client'

import { buttonVariants } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AddressForm } from './address-form'
import { Addresses } from './addresses'
import { Confirm } from './confirm'
import { Payment } from './payment'
import { PickupOptions } from './pickup-options'

export function FinalizePurchaseDrawer() {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get('step')

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Link
          href={currentStep ? '#' : '?step=pickup'}
          className={cn(buttonVariants(), 'flex w-full')}
        >
          Finalizar a compra
        </Link>
      </DrawerTrigger>
      <DrawerContent>
        {(currentStep === 'pickup' || !currentStep) && <PickupOptions />}
        {currentStep === 'address' && <Addresses />}
        {currentStep === 'new-address' && <AddressForm />}
        {currentStep === 'payment' && <Payment />}
        {currentStep === 'confirm' && <Confirm />}
      </DrawerContent>
    </Drawer>
  )
}
