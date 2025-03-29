import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signUserOut } from './actions'

export async function SignOutButton() {
  async function handleSignOut() {
    'use server'

    await signUserOut()
  }

  return (
    <form action={handleSignOut} className="flex">
      <Button
        variant="ghost"
        className="flex flex-row items-center justify-between mx-auto w-full max-w-xs"
      >
        Sair
        <LogOut className="ml-2 w-4 h-4" />
      </Button>
    </form>
  )
}
