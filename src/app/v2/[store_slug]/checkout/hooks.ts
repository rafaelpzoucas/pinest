// hooks/useCheckoutFlow.ts
import { parseAsStringEnum, useQueryState } from 'nuqs'

const checkoutSteps = ['pickup', 'payment', 'summary'] as const
type CheckoutStep = (typeof checkoutSteps)[number]

export function useCheckoutFlow() {
  const [step, setStep] = useQueryState(
    'step',
    parseAsStringEnum([...checkoutSteps]).withDefault('pickup'),
  )

  const currentStepIndex = checkoutSteps.indexOf(step)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === checkoutSteps.length - 1

  const nextStep = () => {
    if (!isLastStep) {
      setStep(checkoutSteps[currentStepIndex + 1])
    }
  }

  const prevStep = () => {
    if (!isFirstStep) {
      setStep(checkoutSteps[currentStepIndex - 1])
    }
  }

  const goToStep = (targetStep: CheckoutStep) => {
    setStep(targetStep)
  }

  const getStepNumber = (targetStep: CheckoutStep) => {
    return checkoutSteps.indexOf(targetStep) + 1
  }

  const canNavigateToStep = (targetStep: CheckoutStep) => {
    // Por enquanto permite navegar para qualquer passo
    // Você pode adicionar lógica de validação aqui
    const targetIndex = checkoutSteps.indexOf(targetStep)
    return targetIndex <= currentStepIndex + 1
  }

  return {
    step,
    steps: checkoutSteps,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    getStepNumber,
    canNavigateToStep,
    totalSteps: checkoutSteps.length,
  }
}
