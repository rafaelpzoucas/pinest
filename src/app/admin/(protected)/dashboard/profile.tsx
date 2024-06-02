import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { readUser } from '../store/(store-options)/account/actions'

export async function ProfileCard() {
  const { data, error } = await readUser()

  if (error) {
    console.log(error)
  }

  const user = data && data[0]
  const store = user?.stores[0]

  const address = `${user?.addresses[0].street}, ${user?.addresses[0].number}`

  return (
    <Link href="store/account">
      <Card>
        <CardContent className="flex flex-row gap-4 pt-6">
          <div className="flex flex-col gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="uppercase">
                {store?.name[0] ?? <User />}
              </AvatarFallback>
            </Avatar>

            <div>
              <strong className="text-lg capitalize">{store?.name}</strong>
              <div>
                <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{user?.phone}</span>
                </span>
                <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{address}</span>
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="ml-auto w-4 h-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  )
}
