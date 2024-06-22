export const statuses = {
  pending: {
    status: 'Pendente',
    next_step: 'Aguardando pagamento do pedido.',
    delivery_address: 'O seu pedido será entregue',
    color: 'bg-blue-500',
  },
  processing: {
    status: 'Processando',
    next_step: 'Seu pedido está sendo processado.',
    delivery_address: 'O seu pedido será entregue',
    color: 'bg-blue-500',
  },
  approved: {
    status: 'Aprovado',
    next_step: 'Preparando seu pedido para envio.',
    delivery_address: 'O seu pedido será entregue',
    color: 'bg-green-500',
  },
  preparing: {
    status: 'Em preparo',
    next_step: 'Seu pedido está sendo preparado para envio.',
    delivery_address: 'O seu pedido será entregue',
    color: 'bg-blue-500',
  },
  picking: {
    status: 'Em Separação',
    next_step: 'Seu pedido está sendo separado para envio.',
    delivery_address: 'O seu pedido será entregue',
    color: 'bg-blue-500',
  },
  shipped: {
    status: 'Despachado',
    next_step: 'Seu pedido está a caminho.',
    delivery_address: 'O seu pedido será entregue',
    color: 'bg-blue-500',
  },
  delivered: {
    status: 'Entregue',
    next_step: 'Obrigado por comprar conosco.',
    delivery_address: 'O seu pedido foi entregue',
    color: 'bg-green-500',
  },
  cancelled: {
    status: 'Cancelado',
    next_step:
      'O pedido foi cancelado. Entre em contato para mais informações.',
    delivery_address: 'O pedido não será entregue.',
    color: 'bg-red-500',
  },
  returned: {
    status: 'Devolvido',
    next_step: 'A devolução foi confirmada. Aguarde o reembolso.',
    delivery_address: 'A devolução foi confirmada.',
    color: 'bg-red-500',
  },
  refunded: {
    status: 'Reembolsado',
    next_step: 'O valor pago foi devolvido.',
    delivery_address: 'O valor pago foi devolvido.',
    color: 'bg-green-500',
  },
  payment_failed: {
    status: 'Falha no Pagamento',
    next_step: 'Houve uma falha no pagamento. Por favor, tente novamente.',
    delivery_address:
      'O pedido não será processado devido a falha no pagamento.',
    color: 'bg-red-500',
  },
  awaiting_payment: {
    status: 'Aguardando Pagamento',
    next_step: 'Aguardando confirmação de pagamento.',
    delivery_address:
      'O pedido será processado após a confirmação do pagamento.',
    color: 'bg-blue-500',
  },
  under_review: {
    status: 'Em Análise',
    next_step: 'Seu pedido está sendo analisado.',
    delivery_address: 'O pedido está sendo revisado.',
    color: 'bg-blue-500',
  },
}
