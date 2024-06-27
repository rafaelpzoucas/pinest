import { cn } from '@/lib/utils'
import * as React from 'react'
import InputMask from 'react-input-mask'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  mask?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mask, ...props }, ref) => {
    // Define as máscaras com base no tipo
    const getMaskByType = (type: string | undefined) => {
      switch (type) {
        case 'cep':
          return '99999-999'
        // Adicione mais casos conforme necessário
        default:
          return null
      }
    }

    const resolvedMask = mask || getMaskByType(type)

    if (resolvedMask) {
      return (
        <InputMask mask={resolvedMask} {...props}>
          {
            ((inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
              <input
                type={type}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-30',
                  className,
                )}
                ref={ref}
                {...inputProps}
              />
            )) as unknown as React.ReactNode
          }
        </InputMask>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-30',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

export { Input }
