import { Stepper } from '@/components/stepper'
import { createOwner, readOwner, readStore } from './actions'
import { AppearenceStep } from './appearence'
import { PaymentStep } from './billing'
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
  const { ownerError } = await createOwner()

  if (userError) {
    console.error(userError)
  }

  if (storeError) {
    console.error(storeError)
  }

  if (ownerError) {
    console.error(ownerError)
  }

  const renderStep = () => {
    switch (searchParams?.step) {
      case '1':
        return <StoreStep store={store} />
      case '2':
        return <AppearenceStep />
      case '3':
        return <PaymentStep />
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
            { label: 'Informações da loja' },
            { label: 'Aparência da loja' },
            { label: 'Cadastro de produtos' },
            { label: 'Configurar pagamentos' },
            { label: 'Configurar envios' },
          ]}
        />
      )}

      <div className="w-full md:max-w-sm h-full mt-20 md:mt-32 px-4">
        {renderStep()}
      </div>
    </div>
  )
}
