import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section id="cover" className="flex items-center justify-center h-dvh">
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl
          gap-4 md:gap-8 px-6"
      >
        <h1 className={cn('text-4xl md:text-7xl font-bold text-primary')}>
          Construa sua Loja em Minutos!
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Design e configurações prontos para você começar a vender rápido.
        </p>

        <div className="flex flex-col gap-2 w-full items-center">
          <Link
            href="#pricing"
            className={cn(buttonVariants(), 'w-full max-w-xs')}
          >
            CRIAR MINHA LOJA <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/admin/sign-in"
            className={buttonVariants({ variant: 'ghost' })}
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  )
}
