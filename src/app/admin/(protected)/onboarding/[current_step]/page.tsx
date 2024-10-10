export default function CurrentStep({
  params,
}: {
  params: { current_step: string }
}) {
  const currentStep = params.current_step

  if (currentStep === 'store') {
    return <main></main>
  }

  return <main></main>
}
