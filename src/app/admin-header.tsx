import { SwitchStoreStatus } from '@/app/switch-store-status'
import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

type HeaderPropsType = {
  title?: string
  withBackButton?: boolean
}

export async function AdminHeader({ title, withBackButton }: HeaderPropsType) {
  const supabase = createClient()

  const { data: userData } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('stores')
    .select('is_open')
    .eq('user_id', userData.user?.id)
    .single()

  return (
    <header className="flex items-center w-full">
      <Card
        className="flex flex-row items-center justify-between gap-2 w-full h-[68px] p-2 lg:p-4
          bg-secondary/50"
      >
        {withBackButton && <BackButton />}

        <h1 className="font-bold ml-3">{title}</h1>

        {data && <SwitchStoreStatus isOpen={data.is_open} />}
      </Card>
    </header>
  )
}
