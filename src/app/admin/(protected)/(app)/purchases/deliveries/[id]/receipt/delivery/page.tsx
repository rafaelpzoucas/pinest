import { readPurchaseById } from '../../actions'
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
  const [purchaseData] = await readPurchaseById({ id: params.id })

  const purchase = purchaseData?.purchase

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
    >
      <Info purchase={purchase} />

      <Items purchase={purchase} />

      <Total purchase={purchase} />

      <Payment purchase={purchase} />

      <Printer />
    </div>
  )
}
