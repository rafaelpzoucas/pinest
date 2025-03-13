import { cn } from '@/lib/utils'
import React from 'react'
import { Card } from './ui/card'

type StepType = {
  label: string
}

type StepperPropsType = {
  currentStep: number
  steps: StepType[]
}

export function Stepper({ currentStep, steps }: StepperPropsType) {
  return (
    <div className="flex flex-row items-center w-full md:max-w-xl px-6">
      {steps &&
        steps.length > 0 &&
        steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={cn(
                'h-1 w-full bg-primary first-of-type:hidden',
                currentStep < index + 1 && 'bg-secondary',
              )}
            ></div>
            <div
              key={index}
              className={cn(
                'relative flex flex-col items-center justify-center gap-4',
                currentStep >= index + 1 && 'text-primary',
              )}
            >
              <Card
                className={cn(
                  'flex items-center justify-center aspect-square w-10 h-10 rounded-xl',
                  currentStep === index + 1 && 'bg-transparent border-primary',
                  currentStep > index + 1 &&
                    'bg-primary text-primary-foreground',
                )}
              >
                {index + 1}
              </Card>

              <span
                className={cn(
                  currentStep < index + 1 && 'text-muted-foreground',
                  'absolute text-center top-12 md:w-24 text-[0.625rem] md:text-sm',
                )}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        ))}
    </div>
  )
}
