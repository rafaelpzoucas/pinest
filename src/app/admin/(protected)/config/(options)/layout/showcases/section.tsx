import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { readShowcases } from './actions'
import { ShowcasesList } from './list'

export async function ShowcasesSection() {
  const { showcases, readShowcasesError } = await readShowcases()

  if (readShowcasesError) {
    console.error(readShowcasesError)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitrines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link
          href="layout/showcases/register"
          className={buttonVariants({ variant: 'outline' })}
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar nova vitrine
        </Link>

        <ShowcasesList showcases={showcases} />
      </CardContent>
    </Card>
  )
}
