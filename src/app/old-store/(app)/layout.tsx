import { StoreStatus } from '@/app/store-status'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StoreStatus />
      {children}
    </>
  )
}
