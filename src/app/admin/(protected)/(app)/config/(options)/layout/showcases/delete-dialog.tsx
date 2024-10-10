'use client'

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteShowcase } from './register/actions'

export function DeleteDialog({ showcaseId }: { showcaseId: string }) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Tem certeza que deseja excluir essa vitrine?
        </AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={() => deleteShowcase(showcaseId)}>
          Sim, excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
