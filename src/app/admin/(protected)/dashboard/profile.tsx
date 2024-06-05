import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, ExternalLink, MapPin, Phone, User } from 'lucide-react'
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
    <Card className="flex flex-col gap-6 p-4">
      <Link href="store/account">
        <div className="flex flex-row gap-4">
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
        </div>
      </Link>

      <Link
        href={`/${store?.name}`}
        target="_blank"
        className={buttonVariants()}
      >
        Ver minha loja
        <ExternalLink className="w-4 h-4 ml-2" />
      </Link>
    </Card>
  )
}
