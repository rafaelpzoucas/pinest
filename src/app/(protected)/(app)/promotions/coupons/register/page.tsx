import { AdminHeader } from "@/app/admin-header";
import { readCouponById } from "../actions";
import { CouponForm } from "../form";

export default async function CouponRegisterPage({
  searchParams,
}: {
  searchParams: { couponId: string };
}) {
  const [couponData] = await readCouponById({
    couponId: searchParams.couponId,
  });

  const coupon = couponData?.coupon;

  return (
    <section className="flex flex-col gap-4 p-4">
      <AdminHeader title="Cadastrar Novo Cupom" withBackButton />

      <section className="max-w-xl mx-auto">
        <CouponForm coupon={coupon} />
      </section>
    </section>
  );
}
