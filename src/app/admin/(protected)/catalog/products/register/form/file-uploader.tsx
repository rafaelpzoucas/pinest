'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatBytes } from '@/lib/utils'
import { ImagePlusIcon, Trash } from 'lucide-react'
import Image from 'next/image'

import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'

export type FileType = File & {
  preview: string
}

type FileUploaderProps = {
  files: FileType[]
  setFiles: Dispatch<SetStateAction<FileType[]>>
}

export function FileUploader({ files, setFiles }: FileUploaderProps) {
  const maxSize = 1024 * 1024 * 10
  const maxFiles = 10

  const [rejected, setRejected] = useState<FileRejection[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ])

      setRejected(rejectedFiles)
    },
    [setFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    multiple: true,
    maxFiles,
    maxSize,
  })

  function handleDeleteFile(file: FileType) {
    const filesWithoutExcluded = files.filter((item) => item.name !== file.name)

    setFiles(filesWithoutExcluded)
  }

  const errorMessages: Record<string, string> = {
    'file-too-large': `O arquivo é muito grande. O tamanho máximo permitido é de ${formatBytes(maxSize)}.`,
    'file-invalid-type':
      'Tipo de arquivo inválido. Apenas imagens são permitidas.',
    'too-many-files': `Você só pode adicionar até ${maxFiles} imagens.`,
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-4 lg:grid-cols-5 gap-2">
        {files.length > 0 &&
          files.map((file) => (
            <Card
              key={file.preview}
              className="relative aspect-square overflow-hidden"
            >
              <Image src={file.preview} alt="" fill className="object-cover" />

              <Button
                type="button"
                variant={'outline'}
                size="icon"
                className="absolute top-1 right-1 w-8 h-8"
                onClick={() => handleDeleteFile(file)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </Card>
          ))}

        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div
            data-drag-active={isDragActive}
            className="flex flex-col items-center justify-center gap-4 aspect-square rounded-lg border border-dashed cursor-pointer text-sm text-center data-[drag-active=true]:border-primary data-[drag-active=true]:bg-primary data-[drag-active=true]:text-primary-foreground transition-all duration-200"
          >
            <ImagePlusIcon className="w-8 h-8 opacity-25" />

            <div className="hidden md:flex flex-col gap-4">
              {isDragActive ? (
                <p>Solte sua imagem aqui</p>
              ) : (
                <p className="hidden md:flex">
                  Arraste e solte sua imagem aqui ou clique para selecionar
                </p>
              )}

              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPEG, PNG, WEBP, SVG
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: 2Mb
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {rejected.length > 0 && (
        <div className="flex flex-col gap-4">
          <header className="flex flex-row items-center justify-between">
            <h2 className="font-bold">Arquivos rejeitados</h2>
            <Button variant="outline" size="sm" onClick={() => setRejected([])}>
              Limpar
            </Button>
          </header>

          <div className="flex flex-col gap-2">
            {rejected.map((file, index) => (
              <Card key={index} className="text-sm p-2 px-3 space-y-2">
                <header className="flex flex-row items-start justify-between gap-2">
                  <p className="line-clamp-2">{file.file.name}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatBytes(file.file.size)}
                  </span>
                </header>

                <p className="text-destructive">
                  {file.errors.map((error, index) => (
                    <span key={index}>
                      {errorMessages[error.code] ?? 'Erro desconhecido'}
                    </span>
                  ))}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
