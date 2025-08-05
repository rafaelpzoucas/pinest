import { notifySchema, NotifyType } from '@/app/api/v1/push/schemas'

export async function nofityCustomer(values: NotifyType) {
  const { description, customerPhone, title, url, icon } =
    notifySchema.parse(values)

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/push/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerPhone,
        title: title ?? 'Atualização do pedido',
        description: description ?? 'A loja atualizou o status do seu pedido!',
        url: url ?? '',
        icon,
      }),
    })
  } catch (error) {
    throw new Error('Erro ao notificar a loja', error as Error)
  }
}
