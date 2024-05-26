import React from 'react'

type StepType = {
  id: string
  title: string
  fields?: string[]
}

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="data-[show=true]:animate-show-item data-[show=false]:animate-hide-item repeat-0"
      {...props}
    />
  )
})
Step.displayName = 'Step'

export { Step, type StepType }

