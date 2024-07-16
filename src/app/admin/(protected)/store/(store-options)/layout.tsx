export default function OptionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="p-4">{children}</div>
}
