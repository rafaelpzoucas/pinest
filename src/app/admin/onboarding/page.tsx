import { Stepper } from '@/components/stepper'
import { getConnectedAccount } from '../(protected)/store/(store-options)/billing/actions'
import { readOwner, readStore } from './actions'
import { PaymentStep } from './billing'
import { OwnerStep } from './owner/steps'
import { ShippingStep } from './shipping'
import { SearchZipCode } from './store/search-zip-code'
import { StoreStep } from './store/steps'

export default async function Onboarding({
  searchParams,
}: {
  searchParams: { step: string }
}) {
  const { user, userError } = await readOwner()
  const { store, storeError } = await readStore()
  const connectedAccount = await getConnectedAccount()

  const isAccountConnected = !!(
    connectedAccount && connectedAccount.data.length > 0
  )

  if (userError) {
    console.error(userError)
  }

  if (storeError) {
    console.error(storeError)
  }

  const renderStep = () => {
    switch (searchParams?.step) {
      case '1':
        return <OwnerStep owner={user} />
      case '2':
        return <StoreStep store={store} />
      case '3':
        return <PaymentStep isConnected={isAccountConnected} />
      case '4':
        return <ShippingStep />
      case 'search-zc':
        return <SearchZipCode />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center pt-8">
      {searchParams.step !== 'search-zc' && (
        <Stepper
          currentStep={parseInt(searchParams?.step)}
          steps={[
            { label: 'Dados do proprietário' },
            { label: 'Dados da loja' },
            { label: 'Conta bancária' },
            { label: 'Configurar envios' },
          ]}
        />
      )}

      <div className="w-full md:max-w-sm h-full mt-20 px-4">{renderStep()}</div>
    </div>
  )
}
