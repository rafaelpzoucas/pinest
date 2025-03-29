import { SignOutButton } from '@/app/admin/(protected)/(app)/config/(options)/account/sign-out'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/server'
import { ChevronsUpDown, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card } from '../ui/card'
import { SidebarFooter } from '../ui/sidebar'

export async function Footer() {
  const supabase = createClient()
  const { data: userData, error: userDataError } = await supabase.auth.getUser()

  if (userDataError) {
    console.error(userDataError)
  }

  const metadata = userData.user?.user_metadata

  return (
    <SidebarFooter>
      <Popover>
        <PopoverTrigger>
          <Card
            className="flex flex-row items-center bg-transparent hover:bg-secondary/75 p-2 text-xs
              text-left"
          >
            <div>
              <div className="flex flex-row gap-4 items-center">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={metadata?.picture} />
                  <AvatarFallback>
                    {metadata?.name[0] ?? <User />}
                  </AvatarFallback>
                </Avatar>
                <strong className="capitalize">{metadata?.name}</strong>
              </div>
            </div>

            <ChevronsUpDown className="w-4 h-4 ml-auto" />
          </Card>
        </PopoverTrigger>
        <PopoverContent align="start">
          <SignOutButton />
        </PopoverContent>
      </Popover>
    </SidebarFooter>
  )
}
