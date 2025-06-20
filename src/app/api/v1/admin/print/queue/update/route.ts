import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { ids } = await req.json()

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Invalid IDs array' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const results: { id: string; success: boolean; error?: string }[] = []

  console.log({ ids })

  for (const id of ids) {
    const { error } = await supabase
      .from('print_queue')
      .update({ printed: true, printed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error(`Error updating id ${id}:`, error)
      results.push({ id, success: false, error: error.message })
    } else {
      results.push({ id, success: true })
    }
  }

  const failed = results.filter((r) => !r.success)

  if (failed.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: 'Some updates failed',
        results,
      },
      { status: 207 }, // Status 207 Multi-Status, usado em respostas parciais
    )
  }

  return NextResponse.json({
    success: true,
    message: 'All updates completed',
    results,
  })
}
