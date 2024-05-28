'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MapPin, Menu as MenuIcon, ScrollText } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const menuOptions = [
  {
    title: 'Minhas compras',
    href: '/purchases',
    icon: ScrollText,
  },
  {
    title: 'Endereços',
    href: '/addresses',
    icon: MapPin,
  },
]

export function Menu() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'default'} size={'icon'} className="">
          <MenuIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuOptions.map((option) => (
          <DropdownMenuItem
            key={option.href}
            className="py-4"
            onClick={() => router.push(pathname + option.href)}
          >
            <option.icon className="w-4 h-4 mr-2" />
            {option.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
