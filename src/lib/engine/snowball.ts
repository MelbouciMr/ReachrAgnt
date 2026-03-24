/**
 * Snowball Engine
 * Computes a 0–100 score from market, social, and treasury signals.
 * When layers reinforce each other, score compounds faster.
 */

export interface SnowballInput {
  marketCap: number
  volume24h: number
  liquidity: number
  priceChange1h: number
  priceChange24h: number
  socialEngagement: number  // 0–100 from X API
  treasuryBalance: number   // in USD
  previousScore: number
}

export interface SnowballResult {
  score: number
  phase: 'WATCH' | 'BUILD' | 'IGNITE' | 'ESCALATE'
  delta: number
  breakdown: {
    market: number
    social: number
    treasury: number
    momentum: number
  }
  shouldPost: boolean
  postThreshold: number
}

const MILESTONES = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000]

function getPhase(score: number): SnowballResult['phase'] {
  if (score < 25) return 'WATCH'
  if (score < 50) return 'BUILD'
  if (score < 75) return 'IGNITE'
  return 'ESCALATE'
}

function getCurrentMilestone(mc: number): number {
  return MILESTONES.find((m) => mc < m) ?? MILESTONES[MILESTONES.length - 1]
}

function getMilestoneProgress(mc: number): number {
  const prev = [...MILESTONES].reverse().find((m) => mc >= m) ?? 0
  const next = getCurrentMilestone(mc)
  if (next === prev) return 100
  return Math.min(100, ((mc - prev) / (next - prev)) * 100)
}

export function computeSnowball(input: SnowballInput): SnowballResult {
  const {
    marketCap,
    volume24h,
    liquidity,
    priceChange1h,
    priceChange24h,
    socialEngagement,
    treasuryBalance,
    previousScore,
  } = input

  // Market score (0–40)
  const volRatio = liquidity > 0 ? volume24h / liquidity : 0
  const milestoneProgress = getMilestoneProgress(marketCap)
  const priceScore = Math.min(20, Math.max(-10, priceChange24h * 0.5))
  const marketScore = Math.min(40, volRatio * 15 + milestoneProgress * 0.15 + priceScore)

  // Social score (0–30)
  const socialScore = Math.min(30, socialEngagement * 0.3)

  // Treasury score (0–20)
  const treasuryScore = Math.min(20, (treasuryBalance / 10_000) * 20)

  // Momentum bonus — layers reinforcing each other (0–10)
  const layersActive = [marketScore > 15, socialScore > 10, treasuryScore > 10].filter(Boolean).length
  const momentumBonus = layersActive >= 2 ? layersActive * 3 : 0

  const rawScore = marketScore + socialScore + treasuryScore + momentumBonus
  const score = Math.min(100, Math.max(0, Math.round(rawScore)))

  const phase = getPhase(score)

  // Threshold to post: IGNITE needs 65+, BUILD needs 72+
  const postThreshold = phase === 'ESCALATE' ? 80 : phase === 'IGNITE' ? 65 : 72
  const shouldPost = score >= postThreshold && priceChange1h > 0

  return {
    score,
    phase,
    delta: score - previousScore,
    breakdown: {
      market: Math.round(marketScore),
      social: Math.round(socialScore),
      treasury: Math.round(treasuryScore),
      momentum: momentumBonus,
    },
    shouldPost,
    postThreshold,
  }
}

export { MILESTONES, getMilestoneProgress, getCurrentMilestone }
