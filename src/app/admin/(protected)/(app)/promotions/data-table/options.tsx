import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Edit, Trash } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { deleteCoupon } from '../coupons/actions'

export function CouponOptions({ id }: { id?: string }) {
  const { execute } = useServerAction(deleteCoupon, {
    onSuccess: () => {
      toast('Cupom excluído com sucesso!')
    },
  })
  const handleDelete = () => {
    if (id) {
      execute({ couponId: id })
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/promotions/coupons/register?couponId=${id}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
      >
        <Edit />
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir este cupom?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={handleDelete}
            >
              Excluir cupom
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
