'use client'

import { readSocialsData } from '@/actions/client/app/public_store/socials'
import { SOCIAL_MEDIAS } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/socials/socials'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePublicStore } from '@/stores/public-store'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export function StoreSocials() {
  const { store } = usePublicStore()

  const { data } = useQuery({
    queryKey: ['socials'],
    queryFn: () => readSocialsData(store?.id),
    enabled: !!store,
  })

  const socials = data?.socials || []

  return (
    <div className="flex flex-row gap-2 w-full max-w-sm">
      {socials &&
        socials.length > 0 &&
        socials.map((social) => {
          const socialMedia = SOCIAL_MEDIAS.find(
            (media) => media.id === social.social_id,
          )

          return (
            socialMedia && (
              <Link
                key={social.id}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'text-2xl',
                )}
              >
                <socialMedia.icon />
              </Link>
            )
          )
        })}
    </div>
  )
}
