import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { computeSnowball } from '@/lib/engine/snowball'
import { getUnannounced, markAnnounced } from '@/lib/engine/milestones'
import { getAgentDecision } from '@/lib/bankr/llm'
import { postTweet, getRecentPosts } from '@/lib/x/client'

function verifyCron(req: NextRequest): boolean {
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get current agent state
    const { data: state } = await supabase
      .from('agent_state')
      .select('*')
      .eq('id', 'singleton')
      .single()

    if (!state) {
      return NextResponse.json({ error: 'No agent state found — run market check first' }, { status: 400 })
    }

    // Get previous snowball state
    const { data: prevSnowball } = await supabase
      .from('snowball_state')
      .select('score')
      .eq('id', 'singleton')
      .single()

    // Compute snowball score
    const snowball = computeSnowball({
      marketCap: state.market_cap,
      volume24h: state.volume_h24,
      liquidity: state.liquidity,
      priceChange1h: state.price_change_1h ?? 0,
      priceChange24h: state.price_change_24h ?? 0,
      socialEngagement: state.social_engagement ?? 0,
      treasuryBalance: state.treasury_balance ?? 0,
      previousScore: prevSnowball?.score ?? 0,
    })

    // Save snowball state
    await supabase.from('snowball_state').upsert({
      id: 'singleton',
      score: snowball.score,
      phase: snowball.phase,
      delta: snowball.delta,
      breakdown: snowball.breakdown,
      updated_at: new Date().toISOString(),
    })

    // Check for unannounced milestones
    const unannounced = await getUnannounced()
    const milestoneToCelebrate = unannounced[0] ?? null

    // Get recent posts for dedup
    const recentPosts = await getRecentPosts(3)

    // Ask Claude via Bankr
    const decision = await getAgentDecision({
      snowball,
      marketCap: state.market_cap,
      volume24h: state.volume_h24,
      priceChange24h: state.price_change_24h ?? 0,
      recentPosts,
      milestoneCrossed: milestoneToCelebrate?.milestone ?? null,
      tokenName: process.env.TOKEN_NAME!,
      tokenTicker: process.env.TOKEN_TICKER!,
    })

    // Save LLM decision
    await supabase.from('llm_decisions').insert({
      should_post: decision.shouldPost,
      post_content: decision.postContent,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      mode: decision.mode,
      snowball_score: snowball.score,
      executed: false,
    })

    // Execute post if decided
    let tweetResult = null
    if (decision.shouldPost && decision.postContent) {
      tweetResult = await postTweet(decision.postContent)

      // Mark milestone announced
      if (milestoneToCelebrate && tweetResult) {
        await markAnnounced(milestoneToCelebrate.id)
      }

      // Update LLM decision as executed
      await supabase
        .from('llm_decisions')
        .update({ executed: true, executed_at: new Date().toISOString() })
        .eq('should_post', true)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    // Update agent mode
    await supabase.from('agent_state').update({
      mode: decision.mode,
      snowball_score: snowball.score,
      last_decision: new Date().toISOString(),
    }).eq('id', 'singleton')

    return NextResponse.json({
      ok: true,
      snowballScore: snowball.score,
      phase: snowball.phase,
      decision: {
        shouldPost: decision.shouldPost,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
      },
      posted: !!tweetResult,
    })
  } catch (err) {
    console.error('[api/agent] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
