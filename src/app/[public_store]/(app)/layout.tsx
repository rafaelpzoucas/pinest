import { StoreStatus } from '@/app/store-status'

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { public_store: string }
}) {
  return (
    <>
      <StoreStatus storeUrl={params.public_store} />
      {children}
    </>
  )
}
