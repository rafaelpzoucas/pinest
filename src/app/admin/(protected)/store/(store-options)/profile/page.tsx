import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit, Phone } from 'lucide-react'
import { fetchUser } from './actions/read-data'

export default async function ProfilePage() {
  const { users } = await fetchUser()

  const store = users && users[0]

  const street = `${store?.user_addresses[0].street}, ${store?.user_addresses[0].number}`
  const city = `${store?.user_addresses[0].city}/${store?.user_addresses[0].state}`
  const zipCode = store?.user_addresses[0].zip_code

  return (
    <main className="flex flex-col gap-4">
      <Card className="relative flex flex-col gap-4 p-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div>
          <strong className="text-lg capitalize">{store?.name}</strong>
          <div>
            <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{store?.phone}</span>
            </span>
          </div>
        </div>

        <Button
          variant={'ghost'}
          size="icon"
          className="absolute top-2 right-2"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Card>

      <Card className="relative flex flex-col gap-4 p-4">
        <h1>Endereço</h1>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <span className="text-muted-foreground text-xs">Logradouro</span>
            <p className="text-sm">{street}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Cidade</span>
            <p className="text-sm">{city}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">CEP</span>
            <p className="text-sm">{zipCode}</p>
          </div>
        </div>

        <Button
          variant={'ghost'}
          size="icon"
          className="absolute top-2 right-2"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Card>
    </main>
  )
}
