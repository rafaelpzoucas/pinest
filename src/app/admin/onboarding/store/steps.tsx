'use client'

import { useSearchParams } from 'next/navigation'
import { NameStep } from './name'
import { RoleStep } from './role'

export function StoreStep() {
  const searchParams = useSearchParams()

  const info = searchParams.get('info')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Informações básicas da loja</h1>

      <div>
        {info === 'name' && <NameStep />}
        {info === 'role' && <RoleStep />}
      </div>
    </div>
  )
}
