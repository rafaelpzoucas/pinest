import { OrderCard } from './order-card'

export type OrderDataType = {
  id: number
  order_id: number
  customer_name: string
  created_at: string
  status: string
  total_amount: number
  delivery_price: number
  payment_type: string
}

export function Orders() {
  const statuses = [
    {
      status: 'waiting',
      status_name: 'Em espera',
    },
    {
      status: 'preparing',
      status_name: 'Em preparo',
    },
    {
      status: 'delivering',
      status_name: 'Em Trânsito',
    },
    {
      status: 'finished',
      status_name: 'Finalizadas',
    },
  ]
  const orders = [
    {
      id: 1,
      order_id: 100,
      customer_name: 'Rafael Zoucas',
      created_at: 'agora mesmo',
      status: 'waiting',
      total_amount: 100.0,
      delivery_price: 20.0,
      payment_type: 'Cartão',
    },
    {
      id: 2,
      order_id: 101,
      customer_name: 'Gabriele Souza',
      created_at: 'agora mesmo',
      status: 'preparing',
      total_amount: 100.0,
      delivery_price: 0,
      payment_type: 'Cartão',
    },
    {
      id: 5,
      order_id: 102,
      customer_name: 'Bia Pinheiro',
      created_at: 'agora mesmo',
      status: 'preparing',
      total_amount: 100.0,
      delivery_price: 20.0,
      payment_type: 'Cartão',
    },
    {
      id: 3,
      order_id: 103,
      customer_name: 'Matheus Pinheiro',
      created_at: 'agora mesmo',
      status: 'delivering',
      total_amount: 100.0,
      delivery_price: 20.0,
      payment_type: 'Cartão',
    },
    {
      id: 4,
      order_id: 104,
      customer_name: 'Caio Ramão',
      created_at: 'agora mesmo',
      status: 'finished',
      total_amount: 100.0,
      delivery_price: 20.0,
      payment_type: 'Cartão',
    },
  ]

  return (
    <section className="flex flex-col gap-2 text-sm">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </section>
  )
}
