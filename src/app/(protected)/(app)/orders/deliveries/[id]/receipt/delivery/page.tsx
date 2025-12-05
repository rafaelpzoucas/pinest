import { readOrderById } from '../../actions'
import { Info } from '../info'
import { Items } from './items'
import { Payment } from './payment'
import { Printer } from './printer'
import { Total } from './total'

export default async function PrintDeliveryReceipt({
  params,
}: {
  params: { id: string }
}) {
  const [orderData] = await readOrderById({ id: params.id })

  const order = orderData?.order

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
    >
      <Info order={order} />

      <Items order={order} />

      <Total order={order} />

      <Payment order={order} />

      <Printer />
    </div>
  )
}
