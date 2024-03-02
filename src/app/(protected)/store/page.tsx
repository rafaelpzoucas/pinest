import {
  Bolt,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  LayoutList,
  Megaphone,
  Paintbrush,
  User,
} from 'lucide-react'
import Link from 'next/link'

export default function StorePage() {
  const iconsClassNames = 'w-6 h-6 text-muted-foreground'
  const storeOptions = [
    {
      link: '/store/account',
      name: 'Minha conta',
      icon: <Bolt className={iconsClassNames} />,
    },
    {
      link: '/store/profile',
      name: 'Perfil',
      icon: <User className={iconsClassNames} />,
    },
    {
      link: '/store/appearence',
      name: 'Aparência',
      icon: <Paintbrush className={iconsClassNames} />,
    },
    {
      link: '/store/hours',
      name: 'Horários',
      icon: <CalendarClock className={iconsClassNames} />,
    },
    {
      link: '/store/payment-methods',
      name: 'Formas de pagamento',
      icon: <CircleDollarSign className={iconsClassNames} />,
    },
    {
      link: '/store/catalog',
      name: 'Catálogo',
      icon: <LayoutList className={iconsClassNames} />,
    },
    {
      link: '/store/marketing',
      name: 'Divulgação',
      icon: <Megaphone className={iconsClassNames} />,
    },
  ]

  return (
    <main className="p-4">
      <h1 className="text-lg text-center font-bold">Minha loja</h1>

      {storeOptions.map((option) => (
        <Link
          href={option.link}
          key={option.link}
          className="flex flex-row gap-4 items-center p-4"
        >
          {option.icon}
          <span>{option.name}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
        </Link>
      ))}
    </main>
  )
}
