import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Cover } from './(landing-page)/cover'
import { Header } from './(landing-page)/header'

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Cover />
    </main>
  )
}
