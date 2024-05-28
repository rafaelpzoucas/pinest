import {
  ChevronRight,
  CircleDollarSign,
  LayoutList,
  Megaphone,
  Paintbrush,
  Truck,
  User,
} from 'lucide-react'
import Link from 'next/link'

export default function StorePage() {
  const storeOptions = [
    {
      link: 'store/profile',
      name: 'Perfil',
      icon: User,
    },
    {
      link: 'store/catalog',
      name: 'Catálogo',
      icon: LayoutList,
    },
    {
      link: 'store/appearence',
      name: 'Aparência da loja',
      icon: Paintbrush,
    },
    {
      link: 'store/payment-methods',
      name: 'Formas de pagamento',
      icon: CircleDollarSign,
    },
    {
      link: 'store/shipping',
      name: 'Formas de envio',
      icon: Truck,
    },
    {
      link: 'store/marketing',
      name: 'Divulgação',
      icon: Megaphone,
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
          <option.icon className="w-6 h-6 text-muted-foreground" />
          <span>{option.name}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
        </Link>
      ))}
    </main>
  )
}
