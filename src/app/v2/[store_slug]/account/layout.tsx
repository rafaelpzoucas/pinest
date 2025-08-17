import { ReactNode } from 'react'

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="p-4 mt-[68px] pb-16">{children}</div>
}
