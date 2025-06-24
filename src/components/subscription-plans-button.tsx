'use client'

import {
  createPlanCheckout,
  upgradeSubscription,
} from '@/app/admin/(protected)/actions'
import { PlanType } from '@/models/plans'
import { useRouter } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { Button } from './ui/button'

export function SubscriptionPlansButton({
  plan,
  index,
  currentPlan,
}: {
  plan: PlanType
  index: number
  currentPlan: PlanType
}) {
  const router = useRouter()

  const {
    execute: executeUpgrade,
    isPending: isPendingUpgrade,
    data: upgradeData,
  } = useServerAction(upgradeSubscription, {
    onSuccess: () => {
      console.log('Checkout realizado com sucesso!', upgradeData)
    },
    onError: (error) => {
      console.error('Erro ao realizar checkout:', error)
    },
  })

  const {
    execute: executeCreate,
    isPending: isPendingCreate,
    data: createData,
  } = useServerAction(createPlanCheckout, {
    onSuccess: () => {
      console.log('Checkout realizado com sucesso!', createData)
      router.push(createData?.sessionURL as string)
    },
    onError: (error) => {
      console.error('Erro ao realizar checkout:', error)
    },
  })

  if (!currentPlan) {
    return (
      <Button
        className="w-full"
        variant={index === 0 ? 'default' : 'secondary'}
        onClick={() =>
          executeCreate({ price_id: plan.price_id, plan_id: plan.id })
        }
        disabled={isPendingCreate}
      >
        {isPendingCreate ? 'Aguarde...' : 'Começar teste grátis'}
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      variant={index === 0 ? 'default' : 'secondary'}
      onClick={() =>
        executeUpgrade({ new_price_id: plan.price_id, new_plan_id: plan.id })
      }
      disabled={isPendingUpgrade}
    >
      {isPendingUpgrade ? 'Aguarde...' : 'Fazer Upgrade'}
    </Button>
  )
}
