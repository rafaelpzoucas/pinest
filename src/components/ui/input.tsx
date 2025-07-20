import { cn } from '@/lib/utils'
import * as React from 'react'
import ReactInputMask from 'react-input-mask'
import { NumericFormat } from 'react-number-format'

type NumericFormatValueType = 'string | number | null | undefined'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  maskType?:
    | 'cep'
    | 'cpf'
    | 'currency'
    | 'kilo'
    | 'custom'
    | 'phone'
    | 'percent'
  customMask?: string
}

export type MaskedInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  maskType?:
    | 'cep'
    | 'cpf'
    | 'currency'
    | 'kilo'
    | 'custom'
    | 'phone'
    | 'percent'
  customMask?: string
}

const maskPatterns: Record<string, string> = {
  cep: '99999-999',
  cpf: '999.999.999-99',
  telefone: '(99) 99999-9999',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, maskType, customMask, ...props }, ref) => {
    const mask =
      maskType && maskType !== 'custom' ? maskPatterns[maskType] : customMask

    const inputClassName = cn(
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-30',
      className,
    )

    const numericFormatProps = {
      value: props.value as NumericFormatValueType,
      onChange: props.onChange,
      name: props.name,
      onBlur: props.onBlur,
      id: props.id,
      'aria-describedby': props['aria-describedby'],
      'aria-invalid': props['aria-invalid'],
      placeholder: props.placeholder,
      className: inputClassName,
    }

    if (maskType === 'currency') {
      return (
        <NumericFormat
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          fixedDecimalScale
          decimalScale={2}
          {...numericFormatProps}
        />
      )
    }

    if (maskType === 'kilo') {
      return (
        <NumericFormat
          decimalSeparator=","
          suffix=" Kg"
          decimalScale={3}
          {...numericFormatProps}
        />
      )
    }

    if (maskType === 'percent') {
      return (
        <NumericFormat
          decimalSeparator=","
          suffix=" %"
          decimalScale={3}
          {...numericFormatProps}
        />
      )
    }

    if (mask) {
      return (
        <ReactInputMask mask={mask} {...props}>
          {
            ((inputProps: any) => (
              <input
                type={type}
                className={inputClassName}
                ref={ref}
                {...inputProps}
              />
            )) as unknown as React.ReactNode
          }
        </ReactInputMask>
      )
    }

    return <input type={type} className={inputClassName} ref={ref} {...props} />
  },
)
Input.displayName = 'Input'

export { Input }
