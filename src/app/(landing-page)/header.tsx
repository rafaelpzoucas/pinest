import Image from 'next/image'
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
    <header className="absolute top-0 left-0 right-0 z-50 flex flex-row items-center justify-center p-6 py-8">
      <Image src={logoDark} alt="pinest" width={150} />
    </header>
  )
}
