import Image from 'next/image'
import { ReactNode } from 'react'

import darkLogo from '@/../public/logo-dark.svg'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div
      className="flex flex-col md:grid md:grid-cols-[1fr_2fr] items-center justify-center gap-4
        h-dvh"
    >
      <aside className="hidden md:flex items-center justify-center">
        <Image src={darkLogo} alt="Pinest" width={250} />
      </aside>

      <div className="md:bg-secondary/30 h-full w-full">
        <ScrollArea className="h-screen px-4 md:px-8">{children}</ScrollArea>
      </div>
    </div>
  )
}
