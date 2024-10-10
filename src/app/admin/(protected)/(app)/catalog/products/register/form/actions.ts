'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductVariationsType, VariationOption } from '@/models/product'
import { revalidatePath } from 'next/cache'

async function readAttributeByName(attributeName: string) {
  const supabase = createClient()

  const { data: attribute, error: attributeError } = await supabase
    .from('attributes')
    .select('*')
    .eq('name', attributeName)
    .single()

  return { attribute, attributeError }
}

async function createAttribute(attributeName: string) {
  const supabase = createClient()

  const { data: createdAttribute, error: createAttributeError } = await supabase
    .from('attributes')
    .insert({ name: attributeName })
    .select()
    .single()

  return { createdAttribute, createAttributeError }
}

async function createVariation(
  option: VariationOption,
  attributeId: string,
  productId: string,
) {
  const supabase = createClient()

  const { data: createdVariation, error: createVariationError } = await supabase
    .from('product_variations')
    .insert({
      ...option,
      attribute_id: attributeId,
      product_id: productId,
    })
    .select()

  return { createdVariation, createVariationError }
}

async function updateVariation(
  option: VariationOption,
  attributeId: string,
  productId: string,
) {
  const supabase = createClient()

  const { error: updateVariationError } = await supabase
    .from('product_variations')
    .update({
      ...option,
      attribute_id: attributeId,
      product_id: productId,
    })
    .eq('id', option.id)
    .select()

  return { updateVariationError }
}

export async function deleteVariation(variationId: string) {
  const supabase = createClient()

  const { error: deleteVariationError } = await supabase
    .from('product_variations')
    .delete()
    .eq('id', variationId)

  if (deleteVariationError) {
    console.error(deleteVariationError)
  }

  return { deleteVariationError }
}

export async function createProductVariations(
  variations: ProductVariationsType[],
  productId: string,
) {
  for (const variation of variations) {
    let attribute = null

    const { attribute: readAttribute, attributeError } =
      await readAttributeByName(variation.attribute)

    if (attributeError) {
      console.error(attributeError)
    }

    console.log(attribute)

    if (!attribute) {
      const { createdAttribute, createAttributeError } = await createAttribute(
        variation.attribute,
      )

      if (createAttributeError) {
        console.error(createAttributeError)
      }

      attribute = createdAttribute
    }

    attribute = readAttribute

    if (variation.product_variations) {
      for (const productVariation of variation.product_variations) {
        if (!productVariation.id) {
          const { createVariationError } = await createVariation(
            productVariation,
            attribute.id,
            productId,
          )
          if (createVariationError) {
            console.error(createVariationError)
          }
        } else {
          const { updateVariationError } = await updateVariation(
            productVariation,
            attribute.id,
            productId,
          )
          if (updateVariationError) {
            console.error(updateVariationError)
          }
        }
      }
    }
  }

  revalidatePath('/catalog')
}
