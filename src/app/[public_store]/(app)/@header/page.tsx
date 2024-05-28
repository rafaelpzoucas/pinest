import Image from 'next/image'
import vercel from '../../../../../public/vercel.svg'
import { Menu } from './menu'

export default function Header() {
  return (
    <div className="p-2">
      <header className="relative p-4 py-4 bg-primary/80 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="relative w-full h-8 max-w-40">
            <Image
              src={vercel}
              fill
              alt=""
              className="object-contain object-left"
            />
          </div>

          <div className="flex flex-row gap-2">
            <Menu />
          </div>
        </div>
      </header>
    </div>
  )
}
