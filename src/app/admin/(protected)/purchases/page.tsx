import { Purchases } from './purchases'

export default function WorkspacePage() {
  return (
    <main className="space-y-6 p-4">
      <h1 className="text-lg text-center font-bold">Pedidos</h1>

      <Purchases />
    </main>
  )
}
