import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const [agentState, snowball, milestones, recentDecisions, recentPosts] = await Promise.all([
      supabase.from('agent_state').select('*').eq('id', 'singleton').single(),
      supabase.from('snowball_state').select('*').eq('id', 'singleton').single(),
      supabase.from('milestones').select('*').order('milestone', { ascending: true }),
      supabase.from('llm_decisions').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('social_posts').select('*').order('posted_at', { ascending: false }).limit(5),
    ])

    return NextResponse.json({
      state: agentState.data,
      snowball: snowball.data,
      milestones: milestones.data ?? [],
      decisions: recentDecisions.data ?? [],
      posts: recentPosts.data ?? [],
    })
  } catch (err) {
    console.error('[api/agent/state] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
