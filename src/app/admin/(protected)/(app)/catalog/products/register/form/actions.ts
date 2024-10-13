'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductVariationType, VariationOption } from '@/models/product'
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
  variations: ProductVariationType[],
  productId: string,
) {
  for (const variation of variations) {
    // Ler ou criar o atributo associado à variação
    const attribute = await findOrCreateAttribute(variation.attributes.name)

    if (!attribute) {
      console.error('Erro ao criar ou encontrar o atributo.')
      continue
    }

    // Verificar se a variação já existe e decidir entre criar ou atualizar
    if (!variation.id) {
      const { createVariationError } = await createVariation(
        variation,
        attribute.id,
        productId,
      )

      if (createVariationError) {
        console.error(createVariationError)
      }
    } else {
      const { updateVariationError } = await updateVariation(
        variation,
        attribute.id,
        productId,
      )

      if (updateVariationError) {
        console.error(updateVariationError)
      }
    }
  }

  revalidatePath('/catalog')
}

// Função auxiliar para ler ou criar o atributo
async function findOrCreateAttribute(attributeName: string) {
  const { attribute: readAttribute, attributeError } =
    await readAttributeByName(attributeName)

  if (attributeError) {
    console.error(attributeError)
    return null
  }

  if (readAttribute) {
    return readAttribute
  }

  const { createdAttribute, createAttributeError } =
    await createAttribute(attributeName)

  if (createAttributeError) {
    console.error(createAttributeError)
    return null
  }

  return createdAttribute
}
