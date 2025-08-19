import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { createPath } from '@/utils/createPath'
import { Home, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SearchSheet } from './search-sheet'

export function Navbar() {
  const params = useParams()

  const storeSlug = params.store_slug as string

  const config = [
    {
      link: createPath('/', storeSlug),
      title: 'Home',
      icon: Home,
    },
    {
      link: createPath('/orders', storeSlug),
      title: 'Pedidos',
      icon: ReceiptText,
    },
  ]

  return (
    <nav className="w-full bg-background backdrop-blur-lg z-40">
      <div className="bg-secondary/20 p-4 flex flex-row items-center justify-around gap-4">
        {config.map((item) => (
          <Link
            key={item.link}
            href={item.link}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              '[&_svg]:size-5',
            )}
          >
            <item.icon className="!w-6 h-6" />
          </Link>
        ))}

        <SearchSheet />
      </div>
    </nav>
  )
}
