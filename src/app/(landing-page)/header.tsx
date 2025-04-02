import Image from 'next/image'

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
    <header
      className="absolute top-0 left-0 right-0 z-50 flex flex-row items-center justify-center p-6
        py-8"
    >
      <Image
        src="/logo-dark.svg"
        alt="pinest"
        width={150}
        height={50}
        className="hidden dark:block"
      />
      <Image
        src="/logo-light.svg"
        alt="pinest"
        width={150}
        height={50}
        className="dark:hidden"
      />
    </header>
  )
}
