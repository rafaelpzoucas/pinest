import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ProductVariationsType } from '@/models/product'
import { Plus, Trash } from 'lucide-react'
import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'
import { deleteVariation } from './actions'

export function Variations({
  variations,
  setVariations,
}: {
  variations: ProductVariationsType[]
  setVariations: Dispatch<SetStateAction<ProductVariationsType[]>>
}) {
  function handleAddOption(index: number) {
    setVariations((prev) => {
      const newVariations = [...prev]
      const variation = newVariations[index]

      const newOptions = variation.product_variations
        ? [...variation.product_variations]
        : []

      newOptions.push({
        name: undefined,
        price: undefined,
        stock: undefined,
      })

      newVariations[index] = {
        ...variation,
        product_variations: newOptions,
      }

      return newVariations
    })
  }

  async function handleRemoveVariation(index: number, variationId?: string) {
    if (variationId) {
      const { deleteVariationError } = await deleteVariation(variationId)

      if (!deleteVariationError) {
        toast('Variação removida com sucesso!')
      }
    }
    setVariations((prev) => prev.filter((_, idx) => idx !== index))
  }

  function handleRemoveOption(variationIndex: number, optionIndex: number) {
    setVariations((prev) => {
      const newVariations = [...prev]
      const variation = { ...newVariations[variationIndex] }

      if (variation.product_variations) {
        variation.product_variations = variation.product_variations.filter(
          (_, idx) => idx !== optionIndex,
        )
      }

      newVariations[variationIndex] = variation

      return newVariations
    })
  }

  function handleInputChange(
    variationIndex: number,
    optionIndex: number,
    field: 'name' | 'price' | 'stock',
    value: string | number,
  ) {
    setVariations((prev) => {
      const newVariations = [...prev]
      const variation = { ...newVariations[variationIndex] }
      const newOptions = [...(variation.product_variations || [])]

      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        [field]: value,
      }

      variation.product_variations = newOptions
      newVariations[variationIndex] = variation

      return newVariations
    })
  }

  function handleAttributeChange(variationIndex: number, value: string) {
    setVariations((prev) => {
      const newVariations = [...prev]
      newVariations[variationIndex] = {
        ...newVariations[variationIndex],
        attribute: value,
      }
      return newVariations
    })
  }

  return (
    <Card className="relative flex flex-col gap-4 p-2">
      <header className="p-2">
        <CardTitle>Variações do produto</CardTitle>
      </header>

      {variations.map((variation, index) => (
        <Card key={index} className="relative flex flex-col gap-4 p-3">
          <Button
            type="button"
            variant="ghost"
            size={'icon'}
            className="absolute top-1 right-1"
            onClick={() => handleRemoveVariation(index, variation?.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>

          <h1>Variação {index + 1}</h1>

          <FormItem>
            <FormLabel>Atributo</FormLabel>
            <FormControl>
              <Input
                placeholder="Insira o nome do atributo..."
                value={variation.attribute}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(index, e.target.value)
                }
              />
            </FormControl>
            <FormDescription>Exemplo: cor, tamanho, etc...</FormDescription>
            <FormMessage />
          </FormItem>

          {variation?.product_variations?.map((option, optionIndex) => (
            <Card
              key={optionIndex}
              className="relative flex flex-col gap-2 p-2"
            >
              <FormItem className="flex-grow">
                <FormLabel>Opção</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insira a opção..."
                    value={option.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        index,
                        optionIndex,
                        'name',
                        e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Exemplo: vermelho, grande, etc...
                </FormDescription>
              </FormItem>
              <FormItem className="flex-grow">
                <FormLabel>Preço da opção</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insira o preço..."
                    type="number"
                    value={option.price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        index,
                        optionIndex,
                        'price',
                        e.target.value,
                      )
                    }
                  />
                </FormControl>
              </FormItem>

              <FormItem className="flex-grow">
                <FormLabel>Estoque</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insira o estoque..."
                    type="number"
                    value={option.stock}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        index,
                        optionIndex,
                        'stock',
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                  />
                </FormControl>
              </FormItem>
              <Button
                type="button"
                variant="ghost"
                size={'icon'}
                className="absolute top-1 right-1"
                onClick={() => handleRemoveOption(index, optionIndex)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </Card>
          ))}

          <Button
            type="button"
            variant={'outline'}
            onClick={() => handleAddOption(index)}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar opção
          </Button>
        </Card>
      ))}

      <Button
        type="button"
        variant={'outline'}
        onClick={() =>
          setVariations((prev) => [
            ...prev,
            {
              attribute: '',
              product_variations: [],
            },
          ])
        }
      >
        <Plus className="w-4 h-4 mr-2" /> Adicionar variação
      </Button>
    </Card>
  )
}
