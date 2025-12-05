'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { SubscriptionType } from '@/models/subscription'
import { Edit } from 'lucide-react'
import Link from 'next/link'

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

import { cancelSubscription } from './actions'

export function ManageSubscription({
  currentSubscription,
}: {
  currentSubscription: SubscriptionType
}) {
  if (!currentSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum plano ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`account/manage-plans`}
            className={cn(buttonVariants(), 'absolute top-2 right-2')}
          >
            Ver planos
          </Link>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Plano atual</CardTitle>
      </CardHeader>

      <CardContent>
        <p>
          {currentSubscription.plans.name}:{' '}
          {formatCurrencyBRL(currentSubscription.plans.price)} por{' '}
          {currentSubscription.plans.recurrence === 'monthly' ? 'mês' : 'ano'}
        </p>
      </CardContent>

      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Cancelar assinatura</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja cancelar?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Ao cancelar, você perderá acesso a todos os recursos da
                  Pinest, incluindo:
                </p>
                <ul>
                  <li>✅ Cardápio digital</li>
                  <li>✅ Controle de pedidos e mesas</li>
                  <li>✅ Relatórios de vendas</li>
                  <li>✅ Integrações com iFood e WhatsApp (caso ativas)</li>
                </ul>

                <p>
                  Se houver algo que possamos melhorar ou se precisar de ajuda,
                  entre em contato com nosso suporte antes de prosseguir.
                </p>

                <p>🔹 Quer continuar com o cancelamento?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: 'destructive' })}
                onClick={() =>
                  cancelSubscription({
                    subscriptionId: currentSubscription.subscription_id,
                  })
                }
              >
                Cancelar assinatura
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>

      <Link
        href={`account/manage-plans`}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute top-2 right-2',
        )}
      >
        <Edit className="w-4 h-4" />
      </Link>
    </Card>
  )
}
