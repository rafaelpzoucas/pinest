import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { formatCurrencyBRL } from '@/lib/utils'
import { ProductType, ProductVariationsType } from '@/models/product'
import { MoreVertical, Plus } from 'lucide-react'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import { VariationsFormType } from './form'

type GroupedVariation = {
  attribute: {
    id: string
    name: string
  }
  variations: Array<ProductVariationsType & { attribute_option: string }>
}

export function groupByAttribute(
  variations: ProductVariationsType[],
): GroupedVariation[] {
  const grouped: { [key: string]: GroupedVariation } = {}

  variations.forEach((variation) => {
    variation.product_variation_attributes.forEach((attr) => {
      const attrName = attr.attribute_options.attributes.name
      const attrId = attr.attribute_options.attributes.id
      const attrOptionValue = attr.attribute_options.value

      if (!grouped[attrName]) {
        grouped[attrName] = {
          attribute: {
            id: attrId,
            name: attrName,
          },
          variations: [],
        }
      }

      const variationWithAttrOption = {
        ...variation,
        attribute_option: attrOptionValue,
      }

      grouped[attrName].variations.push(variationWithAttrOption)
    })
  })

  return Object.values(grouped)
}

export function Variations({
  variations,
  variationsForm,
  product,
  setVariationsForm,
}: {
  variationsForm: VariationsFormType[] | null
  setVariationsForm: Dispatch<SetStateAction<VariationsFormType[] | null>>
  product: ProductType | null
  variations?: ProductVariationsType[]
}) {
  const variationsByAttribute = variations ? groupByAttribute(variations) : []

  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <CardTitle>Variações do produto</CardTitle>

      <Link
        href={`register/variations${product && '?product_id=' + product.id}`}
        className={buttonVariants({ variant: 'outline' })}
      >
        <Plus className="w-4 h-4 mr-2" /> Adicionar Variação
      </Link>

      {variationsByAttribute &&
        variationsByAttribute.length > 0 &&
        variationsByAttribute.map((attribute, index) => (
          <Card
            key={attribute.attribute.id}
            className="relative p-2 px-3 space-y-4"
          >
            <strong>{attribute.attribute.name}</strong>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-3 right-1"
                >
                  <MoreVertical className="w-4 h-4 " />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link
                    href={`register/variations?product_id=${product?.id}&attribute_id=${attribute.attribute.id}`}
                  >
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {attribute.variations.map((variation) => (
              <Card className="p-4 space-y-4" key={variation.id}>
                <CardTitle>{variation.attribute_option}</CardTitle>
                <div className="grid grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Preço</Label>
                    <p>
                      {variation && variation.price
                        ? formatCurrencyBRL(parseFloat(variation.price))
                        : product && formatCurrencyBRL(product.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-muted-foreground">Estoque</Label>
                    <p>{variation ? variation.stock ?? product?.stock : ''}</p>
                  </div>
                </div>
              </Card>
            ))}
          </Card>
        ))}
    </Card>
  )
}
