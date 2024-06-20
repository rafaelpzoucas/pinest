import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, queryParamsLink } from '@/lib/utils'
import { UserType } from '@/models/user'
import { Edit, Phone } from 'lucide-react'
import Link from 'next/link'

export function Profile({ user }: { user: UserType | null }) {
  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <Avatar className="w-16 h-16">
        <AvatarFallback>{user?.name[0]}</AvatarFallback>
      </Avatar>

      <div>
        <strong className="text-lg capitalize">{user?.name}</strong>
        <div>
          <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{user?.phone}</span>
          </span>
        </div>
      </div>

      <Link
        href={`account/register/profile?${queryParamsLink(user)}`}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute top-2 right-2',
        )}
      >
        <Edit className="w-4 h-4" />
      </Link>
    </Card>
  )
}
