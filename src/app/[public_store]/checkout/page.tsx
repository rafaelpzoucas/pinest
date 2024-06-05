export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { step: string }
}) {
  return (
    <section>
      {/* {(searchParams.step === 'pickup' || !searchParams.step) && (
        <PickupOptions />
      )} */}
      {/* {searchParams.step === 'address' && <Addresses />}
      {searchParams.step === 'new-address' && <AddressForm />}
      {searchParams.step === 'payment' && <Payment />}
      {searchParams.step === 'confirm' && <Confirm />} */}
    </section>
  )
}
