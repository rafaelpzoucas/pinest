'use client'

import { ChevronsUpDown, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card } from '../ui/card'
import { useSidebar } from '../ui/sidebar'

export function UserCard({ metadata }: { metadata: any }) {
  const { state } = useSidebar()

  const isCollapsed = state === 'collapsed'

  return (
    <Card
      className="flex flex-row items-center bg-transparent hover:bg-secondary/75 p-2 text-xs
        text-left data-[collapsed=true]:border-0 data-[collapsed=true]:p-0"
      data-collapsed={isCollapsed}
    >
      <div>
        <div className="flex flex-row gap-4 items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback>{metadata?.name[0] ?? <User />}</AvatarFallback>
          </Avatar>
          <strong
            className="capitalize data-[collapsed=true]:hidden"
            data-collapsed={isCollapsed}
          >
            {metadata?.name}
          </strong>
        </div>
      </div>

      <ChevronsUpDown className="w-4 h-4 ml-auto" />
    </Card>
  )
}
