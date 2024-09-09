import {
  ChevronRight,
  CircleDollarSign,
  LayoutList,
  Truck,
  User,
} from 'lucide-react'
import Link from 'next/link'

export default function StorePage() {
  const storeOptions = [
    {
      link: 'config/account',
      name: 'Conta',
      icon: User,
    },
    {
      link: 'config/catalog',
      name: 'Catálogo',
      icon: LayoutList,
    },
    // {
    //   link: 'config/appearence',
    //   name: 'Aparência da loja',
    //   icon: Paintbrush,
    // },
    {
      link: 'config/billing',
      name: 'Formas de pagamento',
      icon: CircleDollarSign,
    },
    {
      link: 'config/shipping',
      name: 'Formas de envio',
      icon: Truck,
    },
    // {
    //   link: 'config/marketing',
    //   name: 'Divulgação',
    //   icon: Megaphone,
    // },
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
          <option.icon className="w-6 h-6 text-muted-foreground" />
          <span>{option.name}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
        </Link>
      ))}
    </main>
  )
}
