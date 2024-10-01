import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { stripe } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import { Clock, Pyramid } from 'lucide-react'
import Link from 'next/link'
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa'
import { getStoreByStoreURL } from '../../actions'
import { readCategoriesByStoreURL } from '../search/actions'
import GoogleTransparencyBadge from './google-transparency-badge'
import { PaymentMethods } from './payment-methods'

export async function Footer({ storeURL }: { storeURL: string }) {
  const { store, storeError } = await getStoreByStoreURL(storeURL)
  const { data: categories, error: categoriesError } =
    await readCategoriesByStoreURL(storeURL)

  await stripe.paymentMethods
    .list({
      type: 'card', // Tipo de método de pagamento (pode ser "card", "bank", etc.)
    })
    .then((paymentMethods) => {
      console.log(paymentMethods)
    })
    .catch((error) => {
      console.error('Erro:', error)
    })

  return (
    <footer>
      <Card className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full p-6 py-6 bg-secondary/50 border-0">
        <section className="flex flex-col space-y-6">
          <div className="flex flex-col items-center lg:flex-row gap-4 w-full max-w-sm">
            <Avatar className="w-24 h-24 lg:w-16 lg:h-16">
              <AvatarImage src={store?.logo_url} className="object-cover" />
              <AvatarFallback>
                <Pyramid />
              </AvatarFallback>
            </Avatar>

            <div className="text-center lg:text-left w-full max-w-72">
              <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
              {store?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {store?.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-center gap-2 w-full max-w-sm">
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'text-2xl',
              )}
            >
              <FaFacebook />
            </Link>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'text-2xl',
              )}
            >
              <FaInstagram />
            </Link>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'text-2xl',
              )}
            >
              <FaYoutube />
            </Link>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-xl">Categorias</h2>

          <ul>
            {categories &&
              categories.length > 0 &&
              categories.map((category) => {
                if (category.products.length > 0) {
                  return (
                    <li key={category.id}>
                      <Link
                        href="#"
                        className={cn(
                          buttonVariants({ variant: 'link' }),
                          'px-0 text-muted-foreground',
                        )}
                      >
                        {category.name}
                      </Link>
                    </li>
                  )
                } else {
                  return null
                }
              })}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold text-xl">Atendimento</h2>

          <div className="flex flex-col gap-4">
            <Link
              href={`https://wa.me/${store?.phone}`}
              className={'flex flex-row items-center gap-2'}
              target="_blank"
            >
              <FaWhatsapp className="w-5 h-5" />
              <p>{store?.phone}</p>
            </Link>
            <div>
              <div className="flex flex-row items-center gap-2">
                <Clock className="w-5 h-5" />
                <p>Horário de Atendimento</p>
              </div>

              <p className="text-sm text-muted-foreground">
                Seg a Sex das 8h às 18h
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold text-xl">Formas de pagamento</h2>

          <PaymentMethods />

          <GoogleTransparencyBadge />
        </section>
      </Card>
    </footer>
  )
}
