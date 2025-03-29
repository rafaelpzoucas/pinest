import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { LinkType } from '@/models/nav-links'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav({ links }: { links: LinkType[] }) {
  const pathname = usePathname()

  const hide = pathname.includes('/register')

  return (
    <nav
      className={cn(
        !hide && 'translate-y-0 duration-200',
        hide && 'translate-y-16 duration-200',
        'fixed z-50 bottom-0 left-0 flex items-center justify-center p-2 w-full',
        'lg:hidden print:hidden',
      )}
    >
      <Card
        className="flex flex-row lg:flex-col items-center justify-around gap-4 w-fit p-1 px-2
          bg-background"
      >
        {links.map((link) => (
          <Link href={link.route} key={link.route} className="relative p-2">
            <link.icon
              className={cn(
                'w-5 h-5',
                'opacity-50',
                pathname.startsWith(link.route) && 'opacity-100',
              )}
            />
            {pathname.startsWith(link.route) && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-1 bg-primary"></span>
            )}
          </Link>
        ))}

        <SidebarTrigger />
      </Card>
    </nav>
  )
}
