import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import loginImage from '../../../public/undraw_breakfast_psiw.svg'

export default function SignIn({
  params,
}: {
  params: { public_store: string }
}) {
  return (
    <main className="flex flex-col items-center gap-12 p-4 py-8">
      <header className="w-full">
        <h1 className="text-2xl font-bold">Olá, visitante</h1>
        <p className="text-muted-foreground">Para começar, faça o seu login</p>
      </header>

      <Image src={loginImage} width={350} height={350} alt="" />

      <div className="flex flex-col gap-2 w-full">
        <Button variant={'outline'} className="w-full">
          Continuar com o Google
        </Button>
        <Button variant={'outline'} className="w-full">
          Continuar com o Apple ID
        </Button>
        <Link replace={false} href={`${params.public_store}/home`}>
          <Button variant={'outline'} className="w-full">
            Continuar sem login
          </Button>
        </Link>
      </div>
    </main>
  )
}
