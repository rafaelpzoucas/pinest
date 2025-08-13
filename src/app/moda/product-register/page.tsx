import Link from 'next/link'
import ProductManagement from './register'

export default async function ProductRegisterPage() {
  return (
    <div>
      <Link href="/moda">Voltar</Link>
      Product Register
      <ProductManagement />
    </div>
  )
}
