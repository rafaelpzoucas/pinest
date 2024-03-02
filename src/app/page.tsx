import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main>
      Landing Page
      <Link href="/dashboard">
        <Button>Dashboard</Button>
      </Link>
    </main>
  )
}
