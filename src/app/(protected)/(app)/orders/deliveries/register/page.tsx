import { readOrderByIdCached } from "../[id]/actions";
import { readStoreDataCached } from "./actions";
import { CreateOrderForm } from "./form";

export default async function CreateOrderPage({
  searchParams,
}: {
  searchParams: { order_id: string };
}) {
  const [[orderData], [data]] = await Promise.all([
    readOrderByIdCached({ id: searchParams.order_id }),
    readStoreDataCached(),
  ]);

  const order = orderData?.order;
  const storeId = data?.store.id;

  return (
    <main className="space-y-6 p-4 lg:px-0 w-full pb-16">
      {data && <CreateOrderForm storeId={storeId} order={order} />}
    </main>
  );
}
