import { AdminHeader } from '@/app/admin-header'
import { Ifood } from './ifood'

export default function IntegrationsPage() {
  return (
    <div className="p-4 lg:px-0 space-y-6">
      <AdminHeader title="Integrações" />

      <div className="grid grid-cols-3 gap-4">
        <Ifood />
      </div>
    </div>
  )
}
