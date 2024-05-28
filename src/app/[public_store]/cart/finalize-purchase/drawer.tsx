'use client'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
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
        <Link href={currentStep ? '#' : '?step=pickup'} className="flex w-full">
          <Button className="w-full">Continuar a compra</Button>
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
