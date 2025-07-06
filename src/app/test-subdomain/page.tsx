import { cookies } from 'next/headers'
import { readStore } from '../[public_store]/actions'

export default async function TestSubdomainPage() {
  const cookieStore = cookies()
  const subdomainCookie = cookieStore.get('public_store_subdomain')?.value
  const [storeData] = await readStore()
  const store = storeData?.store

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Teste de Subdomínio</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Cookie do Subdomínio:</h2>
        <p className="bg-gray-100 p-2 rounded">
          {subdomainCookie || 'Não encontrado'}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Dados da Loja:</h2>
        {store ? (
          <div className="bg-green-100 p-4 rounded">
            <p>
              <strong>Nome:</strong> {store.name}
            </p>
            <p>
              <strong>Subdomínio:</strong> {store.store_subdomain}
            </p>
            <p>
              <strong>ID:</strong> {store.id}
            </p>
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded">
            <p>Loja não encontrada</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Todos os Cookies:</h2>
        <div className="bg-gray-100 p-2 rounded">
          {Array.from(cookieStore.getAll()).map((cookie) => (
            <div key={cookie.name}>
              <strong>{cookie.name}:</strong> {cookie.value}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Links de Teste:</h2>
        <div className="space-y-2">
          <a href="/loja-teste" className="block text-blue-600 hover:underline">
            /loja-teste (simula loja-teste.pinest.com.br)
          </a>
          <a href="/outra-loja" className="block text-blue-600 hover:underline">
            /outra-loja (simula outra-loja.pinest.com.br)
          </a>
        </div>
      </div>
    </div>
  )
}
