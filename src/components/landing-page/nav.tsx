'use client'

import * as React from 'react'

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

export type NavigationItemsType = {
  title: string
  href: string
  subItems?: {
    title: string
    description: string
    href: string
  }[]
}

type NavProps = {
  items: NavigationItemsType[]
}

export function Nav({ items }: NavProps) {
  return (
    <>
      <NavigationMenu className={cn('hidden md:flex')}>
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.title}>
              {item.subItems && item.subItems.length > 0 ? (
                <NavigationMenuTrigger
                  className={cn(navigationMenuTriggerStyle(), 'bg-transparent')}
                >
                  {item.title}
                </NavigationMenuTrigger>
              ) : (
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'bg-transparent',
                    )}
                  >
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              )}
              <NavigationMenuContent>
                <ul
                  className={cn(
                    'grid gap-3 p-4 md:w-[400px] lg:w-[250px] lg:grid-cols-1',
                  )}
                >
                  {item.subItems &&
                    item.subItems.map((subItem) => (
                      <ListItem
                        href={subItem.href}
                        title={subItem.title}
                        key={subItem.title}
                      >
                        {subItem.description}
                      </ListItem>
                    ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <Drawer>
        <DrawerTrigger asChild>
          <Button variant={'ghost'} size={'icon'} className="md:hidden">
            <Menu />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <NavigationMenu>
            <NavigationMenuList>
              {items.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.subItems && item.subItems.length > 0 ? (
                    <NavigationMenuTrigger
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent',
                      )}
                    >
                      {item.title}
                    </NavigationMenuTrigger>
                  ) : (
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'bg-transparent',
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  )}
                  <NavigationMenuContent>
                    <ul
                      className={cn(
                        'grid gap-3 p-4 md:w-[400px] lg:w-[250px] lg:grid-cols-1',
                      )}
                    >
                      {item.subItems &&
                        item.subItems.map((subItem) => (
                          <ListItem
                            href={subItem.href}
                            title={subItem.title}
                            key={subItem.title}
                          >
                            {subItem.description}
                          </ListItem>
                        ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </DrawerContent>
      </Drawer>
    </>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            `block select-none space-y-1 rounded-md p-3 leading-none no-underline
            outline-none transition-colors hover:bg-accent hover:text-accent-foreground
            focus:bg-accent focus:text-accent-foreground`,
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
