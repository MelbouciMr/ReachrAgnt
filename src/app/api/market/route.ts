import { NextRequest, NextResponse } from 'next/server'
import { getPairData, formatMarketCap } from '@/lib/dexscreener/client'
import { supabase } from '@/lib/supabase/client'
import { checkMilestone } from '@/lib/engine/milestones'

function verifyCron(req: NextRequest): boolean {
  const secret = req.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pairAddress = process.env.AGENT_PAIR_ADDRESS!

  try {
    const pair = await getPairData(pairAddress)
    if (!pair) {
      return NextResponse.json({ error: 'Pair not found' }, { status: 404 })
    }

    const mc = pair.marketCap ?? 0
    const liquidity = pair.liquidity?.usd ?? 0
    const volume = pair.volume?.h24 ?? 0

    // Save market snapshot
    await supabase.from('market_snapshots').insert({
      market_cap: mc,
      liquidity_usd: liquidity,
      volume_h24: volume,
      price_usd: parseFloat(pair.priceUsd ?? '0'),
      captured_at: new Date().toISOString(),
    })

    // Check milestones
    const { crossed, milestone } = await checkMilestone(mc, liquidity, volume)

    // Update agent state
    await supabase.from('agent_state').upsert({
      id: 'singleton',
      market_cap: mc,
      liquidity: liquidity,
      volume_h24: volume,
      formatted_cap: formatMarketCap(mc),
      last_market_check: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      marketCap: mc,
      formattedCap: formatMarketCap(mc),
      milestoneCrossed: crossed ? milestone : null,
    })
  } catch (err) {
    console.error('[api/market] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
