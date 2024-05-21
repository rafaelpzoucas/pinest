'use client'

import { useSearchParams } from 'next/navigation'
import { AddressStep } from './address'
import { NameStep } from './name'
import { PhoneStep } from './phone'

export function ProfileStep() {
  const searchParams = useSearchParams()

  const info = searchParams.get('info')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Informações básicas da loja</h1>

      <div>
        {info === 'name' && <NameStep />}
        {info === 'phone' && <PhoneStep />}
        {info === 'address' && <AddressStep />}
      </div>
    </div>
  )
}
