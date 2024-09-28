import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { MoreVertical, Plus } from 'lucide-react'
import Link from 'next/link'
import { readBenefits } from './actions'
import { DeleteDialog } from './benefits/delete-dialog'

export async function BenefitsSection() {
  const { benefits, readBenefitsError } = await readBenefits()

  if (readBenefitsError) {
    console.error(readBenefitsError)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefícios</CardTitle>
        <CardDescription>
          Adicione até 6 benefícios da sua loja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <AlertDialog>
          {benefits &&
            benefits.length > 0 &&
            benefits.map((benefit) => (
              <Card key={benefit.id} className="relative">
                <CardHeader>
                  <CardTitle>{benefit.name}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({
                          variant: 'ghost',
                          size: 'icon',
                        }),
                        'absolute top-0 right-1',
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Opções</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link
                          href={`layout/benefits/register?id=${benefit.id}`}
                        >
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <AlertDialogTrigger>Excluir</AlertDialogTrigger>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <DeleteDialog benefitId={benefit.id} />
              </Card>
            ))}
        </AlertDialog>

        {benefits && benefits?.length < 6 && (
          <Link
            href="layout/benefits/register"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar novo benefício
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
