import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { UserType } from '@/models/user'
import { AtSign, Edit } from 'lucide-react'
import Link from 'next/link'
import { SignOutButton } from './sign-out'

export async function Profile({ user }: { user: UserType | null }) {
  const supabase = createClient()
  const { data: userData, error: userDataError } = await supabase.auth.getUser()

  if (userDataError) {
    console.error(userDataError)
  }

  const metadata = userData.user?.user_metadata

  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <div className="flex flex-row gap-4 items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src={metadata?.picture} />
          <AvatarFallback>{user?.name[0]}</AvatarFallback>
        </Avatar>
        <strong className="capitalize">{user?.name}</strong>
      </div>

      <div className="space-y-1">
        <div>
          <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
            <AtSign className="w-4 h-4" />
            <span>{metadata?.email}</span>
          </span>
        </div>
      </div>

      <Link
        href={`account/register/profile?id=${user?.id}`}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute top-2 right-2',
        )}
      >
        <Edit className="w-4 h-4" />
      </Link>

      <Separator />

      <SignOutButton />
    </Card>
  )
}
