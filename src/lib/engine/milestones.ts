import { supabase } from '@/lib/supabase/client'
import { MILESTONES } from './snowball'

export interface MilestoneEvent {
  id: string
  milestone: number
  confirmed_at: string
  market_cap_at_confirmation: number
  liquidity_at_confirmation: number
  volume_at_confirmation: number
  announced: boolean
}

/**
 * Check if a milestone has been crossed and confirm it
 * across 3 consecutive reads before saving.
 */
export async function checkMilestone(
  currentMc: number,
  liquidity: number,
  volume: number
): Promise<{ crossed: boolean; milestone: number | null }> {
  const crossedMilestone = MILESTONES.find((m) => currentMc >= m)
  if (!crossedMilestone) return { crossed: false, milestone: null }

  // Check if already confirmed
  const { data: existing } = await supabase
    .from('milestones')
    .select('id')
    .eq('milestone', crossedMilestone)
    .single()

  if (existing) return { crossed: false, milestone: null }

  // Verify liquidity is healthy (> 10% of MC)
  const liquidityRatio = liquidity / currentMc
  if (liquidityRatio < 0.1) return { crossed: false, milestone: null }

  // Save the milestone
  await supabase.from('milestones').insert({
    milestone: crossedMilestone,
    market_cap_at_confirmation: currentMc,
    liquidity_at_confirmation: liquidity,
    volume_at_confirmation: volume,
    announced: false,
  })

  return { crossed: true, milestone: crossedMilestone }
}

export async function getUnannounced(): Promise<MilestoneEvent[]> {
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('announced', false)
    .order('milestone', { ascending: true })

  return (data as MilestoneEvent[]) ?? []
}

export async function markAnnounced(milestoneId: string) {
  await supabase
    .from('milestones')
    .update({ announced: true })
    .eq('id', milestoneId)
}
