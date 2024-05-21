'use server'

import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

type RequestType = {
  route: string
  columns?: any
  filter: { key: string; value: string }
}

type CreateType = Omit<RequestType, 'filter'>
type ReadType = RequestType
type UpdateType = RequestType
type DeleteType = Omit<RequestType, 'columns'>

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()

  return { data, error }
}

export async function createRow({ route, columns }: CreateType) {
  const { data, error } = await supabase.from(route).insert(columns).select()

  return { data, error }
}

export async function readRows({ route, columns, filter }: ReadType) {
  const { data, error } = await supabase
    .from(route)
    .select(columns)
    .eq(filter.key, filter.value)

  return { data, error }
}

export async function updateRow({ route, columns, filter }: UpdateType) {
  const { data, error } = await supabase
    .from(route)
    .update(columns)
    .eq(filter.key, filter.value)
    .select()

  return { data, error }
}

export async function deleteRow({ route, filter }: DeleteType) {
  const { error } = await supabase
    .from(route)
    .delete()
    .eq(filter.key, filter.value)

  return { error }
}
