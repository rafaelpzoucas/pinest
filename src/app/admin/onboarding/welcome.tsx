import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function WelcomeStep() {
  return (
    <div className="flex flex-col gap-6">
      <h2>
        Bem vindo à <strong className="text-primary">Pinest</strong>,
      </h2>
      <h1 className="text-3xl font-bold">
        Vamos te ajudar a criar uma loja virtual incrível.
      </h1>

      <Link
        href="?step=profile&info=name"
        className={cn(buttonVariants(), 'mt-10')}
      >
        Vamos começar <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  )
}
