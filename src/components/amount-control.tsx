import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

export function AmountControl() {
  const [amount, setAmount] = useState(1)

  function increase() {
    setAmount((prev) => prev + 1)
  }

  function decrease() {
    if (amount > 1) {
      setAmount((prev) => prev - 1)
    }
  }

  return (
    <div className="flex flex-row items-center gap-3">
      <Button
        variant={'secondary'}
        size={'icon'}
        onClick={decrease}
        disabled={amount === 1}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <input
        type="text"
        readOnly
        className="text-center w-5 bg-transparent"
        value={amount}
      />
      <Button variant={'secondary'} size={'icon'} onClick={increase}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}
