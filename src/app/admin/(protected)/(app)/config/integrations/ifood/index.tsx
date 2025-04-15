import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import Image from 'next/image'
import { getIfoodMerchantId } from './actions'
import { MerchantIdForm } from './form'

export async function Ifood() {
  const [merchant] = await getIfoodMerchantId()

  const merchantId = merchant?.merchant_id

  return (
    <Card>
      <CardHeader>
        <Image src="/ifood.png" alt="Logo do iFood" width={100} height={100} />
        <CardDescription>
          Faça a integração do seu iFood para centralizar os pedidos na Pinest.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* <p>Disponível em breve</p> */}
        <MerchantIdForm merchantId={merchantId} />
      </CardContent>
    </Card>
  )
}
