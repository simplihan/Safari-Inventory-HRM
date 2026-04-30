import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()
  const userId = session.user.id
  const now = new Date().toISOString()

  // Get last open entry
  const { data: lastEntry } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
    .single()

  if (action === 'in') {
    if (!lastEntry || lastEntry.type === 'break') {
      if (lastEntry?.type === 'break') {
        await supabase.from('time_entries').update({ end_time: now }).eq('id', lastEntry.id)
      }
      const { error } = await supabase.from('time_entries').insert({
        user_id: userId,
        type: 'work',
        start_time: now,
        work_session_id: lastEntry?.work_session_id || crypto.randomUUID()
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else if (action === 'out') {
    if (lastEntry?.type === 'work') {
      const { error } = await supabase.from('time_entries').insert({
        user_id: userId,
        type: 'break',
        start_time: now,
        work_session_id: lastEntry.work_session_id
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
