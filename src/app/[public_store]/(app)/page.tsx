import Categories from './categories/page'
import Header from './header/page'
import ProductsList from './productsList/page'
import Showcases from './showcases/page'

export default function HomePage({
  params,
}: {
  params: { public_store: string }
}) {
  return (
    <div className="space-y-8">
      <Header params={{ public_store: params.public_store }} />
      <Categories params={{ public_store: params.public_store }} />
      <Showcases params={{ public_store: params.public_store }} />
      <ProductsList params={{ public_store: params.public_store }} />
    </div>
  )
}
