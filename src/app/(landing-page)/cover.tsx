import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function Cover() {
  return (
    <section id="cover" className="flex items-center justify-center">
      {/* <div className="fixed w-full h-screen">
        <Image src={hero} alt="" fill className="object-cover opacity-30" />
      </div> */}

      <aside className="relative z-10 w-full md:max-w-5xl h-screen flex flex-col items-center justify-center text-center gap-4 md:gap-8 p-8">
        <span>Transforme sua Ideia em Lucro</span>
        <h1
          className={cn(
            'text-4xl md:text-7xl font-bold text-primary uppercase',
          )}
        >
          Crie sua Loja Virtual em Poucos Passos!
        </h1>
        <p className="text-muted-foreground md:text-xl md:max-w-3xl">
          Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!
          Comece agora.
        </p>

        <Link
          href="/admin/sign-in"
          className={cn(
            buttonVariants({ variant: 'default', size: 'lg' }),
            'mt-10',
          )}
        >
          Criar loja agora
        </Link>
      </aside>
    </section>
  )
}
