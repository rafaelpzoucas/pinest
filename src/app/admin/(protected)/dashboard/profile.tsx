import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { readStore } from './actions'

export async function ProfileCard() {
  const { store, storeError } = await readStore()

  if (storeError) {
    console.error(storeError)
  }

  return (
    <Card className="flex flex-col gap-6 p-4 max-w-sm">
      <Link
        href={`/${store?.store_url}`}
        target="_blank"
        className={buttonVariants()}
      >
        Ver minha loja
        <ExternalLink className="w-4 h-4 ml-2" />
      </Link>
    </Card>
  )
}
