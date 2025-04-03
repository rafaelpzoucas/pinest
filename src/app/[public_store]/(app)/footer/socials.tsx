import { readStoreSocials } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import { SOCIAL_MEDIAS } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/socials/socials'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export async function StoreSocials() {
  const [socialsData] = await readStoreSocials()

  const socials = socialsData?.socials || []

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
