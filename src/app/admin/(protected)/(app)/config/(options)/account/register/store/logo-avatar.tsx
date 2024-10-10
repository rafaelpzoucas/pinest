'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StoreType } from '@/models/store'
import { Trash, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { removeStoreLogo } from './actions'
import { uploadLogo } from './client-actions'
import { FileType, LogoUploader } from './logo-uploader'

export function LogoAvatar({ store }: { store: StoreType | null }) {
  const [file, setFile] = useState<FileType[]>([])

  async function handleDeleteLogo() {
    if (store) {
      const { error } = await removeStoreLogo(store?.id)

      if (error) {
        console.error(error)
      }
    }
  }

  async function handleUpdateLogo() {
    if (file.length > 0 && store) {
      const { uploadError } = await uploadLogo(file, store?.id)

      if (uploadError) {
        console.error(uploadError)
      }
    }
  }

  useEffect(() => {
    if (file.length > 0) {
      handleUpdateLogo()
    }
  }, [file]) // eslint-disable-line

  return (
    <>
      {store?.logo_url ? (
        <div className="flex items-center justify-center">
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-48 md:h-48 bg-background/30 border">
              <AvatarImage
                src={store?.logo_url}
                className="object-scale-down"
              />
              <AvatarFallback>
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>

            <Button
              type="button"
              variant={'outline'}
              size="icon"
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full"
              onClick={handleDeleteLogo}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <LogoUploader files={file} setFiles={setFile} />
      )}
    </>
  )
}
