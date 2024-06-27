import { ReactNode } from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-fit">{children}</div>
    </div>
  )
}
