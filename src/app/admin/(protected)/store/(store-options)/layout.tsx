import { Header } from './header'

export default function OptionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="space-y-6 p-4">
      <Header />
      {children}
    </div>
  )
}
