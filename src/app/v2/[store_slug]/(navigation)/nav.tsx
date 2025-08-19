'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { useCheckoutFlow } from '../checkout/hooks'
import { useNavigation } from './hooks'

export function HeaderNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()

  const back = searchParams.get('back')

  const { config } = useNavigation()
  const { step, prevStep } = useCheckoutFlow()

  const handleBack = () => {
    if (back === 'home') {
      router.push(`/v2/${params.store_slug}/`)
      return
    }

    if (pathname.includes('checkout') && step !== 'pickup') {
      prevStep()
      return
    }

    if (config.backTo) {
      router.push(config.backTo)
    } else {
      router.back()
    }
  }

  const getHeaderStyles = () => {
    switch (config.variant) {
      case 'background':
        return 'bg-background'
      case 'blur':
        return 'bg-background/80 backdrop-blur-sm border-b'
      default:
        return 'bg-transparent'
    }
  }

  if (!config.showBackButton && !config.title && !config.actions?.length) {
    return null
  }

  return (
    <header
      className={cn(
        getHeaderStyles(),
        'fixed top-0 left-0 right-0 w-full p-4 z-30 flex items-center justify-between',
      )}
    >
      <div className="flex items-center gap-4">
        {config.showBackButton && (
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={handleBack}
          >
            <ArrowLeft />
          </Button>
        )}

        {config.title && (
          <h1 className="text-lg font-semibold">{config.title}</h1>
        )}
      </div>

      {config.actions && (
        <div className="flex items-center gap-2">{config.actions}</div>
      )}
    </header>
  )
}
