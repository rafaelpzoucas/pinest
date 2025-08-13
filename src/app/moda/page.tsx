import Link from 'next/link'

export default async function ModaPage() {
  return (
    <div>
      Master Tenant{' '}
      <Link href="/moda/product-register">Cadastro de produtos</Link>
    </div>
  )
}
