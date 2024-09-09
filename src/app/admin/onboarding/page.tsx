import { Stepper } from '@/components/stepper'
import { readOwner, readStore } from './actions'
import { OwnerStep } from './owner/steps'
import { SearchZipCode } from './store/search-zip-code'
import { StoreStep } from './store/steps'

export default async function Onboarding({
  searchParams,
}: {
  searchParams: { step: string }
}) {
  const { user, userError } = await readOwner()
  const { store, storeError } = await readStore()

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
          ]}
        />
      )}

      <div className="w-full md:max-w-sm h-full mt-20 md:mt-32 px-4">
        {renderStep()}
      </div>
    </div>
  )
}
