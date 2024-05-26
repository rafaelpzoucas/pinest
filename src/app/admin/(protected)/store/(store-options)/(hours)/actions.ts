'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hoursFormSchema } from './form'

const supabase = createClient()

export type HoursType = {
  id: string
  week_day: string
  open_time: string
  close_time: string
  created_at: string
  store_id: string
}

export async function createHour(values: z.infer<typeof hoursFormSchema>) {
  const { data, error } = await supabase
    .from('operating_hours')
    .insert([values])
    .select()

  revalidatePath('/hours')

  return { data, error }
}

export async function readHours(): Promise<{
  data: HoursType[] | null
  error: any | null
}> {
  const { data, error } = await supabase.from('operating_hours').select('*')

  return { data, error }
}

export async function updateHour(
  id: string,
  values: z.infer<typeof hoursFormSchema>,
) {
  const { data, error } = await supabase
    .from('operating_hours')
    .update({ other_column: 'otherValue' })
    .eq('id', id)
    .select()

  revalidatePath('/catalog')

  return { data, error }
}
