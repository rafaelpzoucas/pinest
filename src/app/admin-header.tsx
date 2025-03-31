import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'

type HeaderPropsType = {
  title?: string
  withBackButton?: boolean
}

export async function AdminHeader({ title, withBackButton }: HeaderPropsType) {
  return (
    <header className="flex items-center w-full print:hidden">
      <Card
        className="flex flex-row items-center justify-between gap-2 w-full h-[68px] p-2 lg:p-4
          bg-secondary/50"
      >
        <div className="flex flex-row items-center">
          {withBackButton && <BackButton />}

          <h1 className="font-bold ml-3">{title}</h1>
        </div>
      </Card>
    </header>
  )
}
