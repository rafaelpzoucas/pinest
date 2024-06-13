import { Nav } from '@/components/landing-page/nav'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import logoDark from '../../../public/logo-dark.svg'

const navItems = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Serviços',
    href: '',
    subItems: [
      {
        title: 'Carpintaria',
        description: 'Serviços de carpintaria',
        href: '#',
      },
    ],
  },
  {
    title: 'Contato',
    href: '#contact',
  },
]

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-center p-4 backdrop-blur-sm">
      <div className="flex flex-row items-center justify-between w-full max-w-7xl">
        <div className="flex flex-row items-center gap-2">
          <Image src={logoDark} alt="pinest" width={120} />
        </div>

        <div className="flex flex-row gap-2">
          <Link
            href="/admin/sign-in"
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            Fazer login
          </Link>

          <Nav items={navItems} />
        </div>
      </div>
    </header>
  )
}
