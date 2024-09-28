'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { navLinks } from '../navigation'

export default function StorePage() {
  const storeOptions = navLinks.filter(
    (link) => link.route === '/admin/config',
  )[0].subLinks

  return (
    <main className="p-4">
      <h1 className="text-lg text-center font-bold">Configurações</h1>

      {storeOptions &&
        storeOptions.map((option) => (
          <Link
            href={option.route}
            key={option.route}
            className="flex flex-row gap-4 items-center p-4"
          >
            <option.icon className="w-6 h-6 text-muted-foreground" />
            <span>{option.title}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </Link>
        ))}
    </main>
  )
}
