import Image from 'next/image'

export default function LoadingStore() {
  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center bg-background">
      <div className="relative w-16 h-16 animate-bounce">
        <Image
          src="/icon-dark.svg"
          fill
          alt="Carregando..."
          className="object-fill"
        />
      </div>
    </div>
  )
}
