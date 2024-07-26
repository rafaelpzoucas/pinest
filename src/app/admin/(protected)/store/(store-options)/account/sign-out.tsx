import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signUserOut } from './actions'

export async function SignOutButton() {
  async function handleSignOut() {
    'use server'

    await signUserOut()
  }

  return (
    <form action={handleSignOut}>
      <Button variant="outline" size="icon">
        <LogOut className="w-4 h-4" />
      </Button>
    </form>
  )
}
