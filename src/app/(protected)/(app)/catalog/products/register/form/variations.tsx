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
import { ProductVariationType } from '@/models/product'
import { Plus, Trash } from 'lucide-react'
import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'
import { deleteVariation } from './actions'

export function Variations({
  variations,
  setVariations,
}: {
  variations: ProductVariationType[]
  setVariations: Dispatch<SetStateAction<ProductVariationType[]>>
}) {
  function handleAddVariation() {
    setVariations((prev) => [
      ...prev,
      {
        id: '',
        name: '',
        price: 0,
        stock: 0,
        attribute_id: '',
        product_id: '',
        created_at: new Date().toISOString(),
        attributes: { id: '', name: '', created_at: new Date().toISOString() },
      },
    ])
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

  function handleInputChange(
    index: number,
    field: keyof ProductVariationType,
    value: string | number,
  ) {
    setVariations((prev) => {
      const newVariations = [...prev]
      newVariations[index] = { ...newVariations[index], [field]: value }
      return newVariations
    })
  }

  function handleAttributeChange(index: number, value: string) {
    setVariations((prev) => {
      const newVariations = [...prev]
      newVariations[index] = {
        ...newVariations[index],
        attributes: { ...newVariations[index].attributes, name: value },
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
            size="icon"
            className="absolute top-1 right-1"
            onClick={() => handleRemoveVariation(index, variation.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>

          <h1>Variação {index + 1}</h1>

          <FormItem>
            <FormLabel>Nome da Variação</FormLabel>
            <FormControl>
              <Input
                placeholder="Insira o nome..."
                value={variation.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(index, 'name', e.target.value)
                }
              />
            </FormControl>
            <FormDescription>Exemplo: vermelho, grande, etc...</FormDescription>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Preço</FormLabel>
            <FormControl>
              <Input
                placeholder="Insira o preço..."
                type="number"
                value={variation.price}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(index, 'price', parseFloat(e.target.value))
                }
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Estoque</FormLabel>
            <FormControl>
              <Input
                placeholder="Insira o estoque..."
                type="number"
                value={variation.stock}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    index,
                    'stock',
                    parseInt(e.target.value, 10) || 0,
                  )
                }
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Atributo</FormLabel>
            <FormControl>
              <Input
                placeholder="Insira o atributo..."
                value={variation.attributes.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(index, e.target.value)
                }
              />
            </FormControl>
            <FormDescription>Exemplo: cor, tamanho, etc...</FormDescription>
          </FormItem>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={handleAddVariation}>
        <Plus className="w-4 h-4 mr-2" /> Adicionar variação
      </Button>
    </Card>
  )
}
