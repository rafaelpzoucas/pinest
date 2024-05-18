import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OptionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="space-y-6 p-4">
      <header className="flex flex-row items-center gap-4">
        <Link href={'/admin/store'}>
          <Button variant={'ghost'} size={'icon'}>
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-lg text-center font-bold">Voltar</h1>
      </header>
      {children}
    </div>
  )
}
