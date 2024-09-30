import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ShowcaseType } from '@/models/showcase'
import { Draggable } from '@hello-pangea/dnd'
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { DeleteDialog } from './delete-dialog'
import { StatusForm } from './status-form'

export function ShowcaseCard({
  showcase,
  index,
}: {
  showcase: ShowcaseType
  index: number
}) {
  return (
    <Draggable draggableId={showcase.id} index={index}>
      {(provided) => (
        <Card
          key={showcase.id}
          className="relative cursor-move"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <CardHeader>
            <CardTitle>{showcase.name}</CardTitle>
            {showcase.description && (
              <CardDescription>{showcase.description}</CardDescription>
            )}

            <div className="absolute top-0 right-1 flex flex-row items-center gap-2">
              <StatusForm showcase={showcase} />

              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                    }),
                  )}
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Opções</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={`layout/showcases/register?id=${showcase.id}`}>
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertDialogTrigger>Excluir</AlertDialogTrigger>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <DeleteDialog showcaseId={showcase.id} />
        </Card>
      )}
    </Draggable>
  )
}
