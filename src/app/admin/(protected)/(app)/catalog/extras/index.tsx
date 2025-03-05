import { Box } from 'lucide-react'

import { readUser } from '../../config/(options)/account/actions'
import { readExtrasByStore } from './actions'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { ExtraCard } from './extra-card'

export async function Extras() {
  const { data: user } = await readUser()
  const { data: extras, error } = await readExtrasByStore(user?.stores[0].id)

  if (error) {
    console.error(error)
    return <div>Não foi possível buscar seus produtos</div>
  }

  if (extras && extras.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
          mx-auto"
      >
        <Box className="w-20 h-20" />
        <p className="text-muted-foreground">Não há adicionais cadastrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="lg:hidden">
        {extras &&
          extras.map((extra) => <ExtraCard key={extra.id} extra={extra} />)}
      </div>

      <div className="hidden lg:flex">
        {extras && <DataTable columns={columns} data={extras} />}
      </div>
    </div>
  )
}
