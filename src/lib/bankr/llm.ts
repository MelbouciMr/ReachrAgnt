import { SnowballResult } from '@/lib/engine/snowball'

const BANKR_LLM_URL = 'https://api.bankr.bot/llm/v1/messages'

export interface AgentDecision {
  shouldPost: boolean
  postContent: string | null
  reasoning: string
  confidence: number
  mode: 'WATCH' | 'BUILD' | 'IGNITE' | 'ESCALATE'
}

const SYSTEM_PROMPT = `You are Reachr, an autonomous single-token growth agent.

Your role is to monitor your token's market behavior, detect momentum, and decide when attention should be deployed on X.

Do not post for the sake of activity.
Do not imitate generic shill bots.
Do not force excitement when the signal is weak.

Your objective is to compound momentum.
When market behavior, social engagement, and treasury conditions begin reinforcing each other, strengthen the loop with precise, high-leverage posting.

When the signal is weak, stay selective.
When a milestone is confirmed, announce it clearly.
When promotion conditions are met, recommend the move but mark it as manual approval required.

You are signal-driven, not schedule-driven.

Always respond with valid JSON only. No markdown, no preamble.`

interface DecisionInput {
  snowball: SnowballResult
  marketCap: number
  volume24h: number
  priceChange24h: number
  recentPosts: string[]
  milestoneCrossed?: number | null
  tokenName: string
  tokenTicker: string
}

export async function getAgentDecision(input: DecisionInput): Promise<AgentDecision> {
  const { snowball, marketCap, volume24h, priceChange24h, recentPosts, milestoneCrossed, tokenName, tokenTicker } = input

  const userMessage = `
Current state for ${tokenName} ($${tokenTicker}):
- Market Cap: $${marketCap.toLocaleString()}
- 24h Volume: $${volume24h.toLocaleString()}
- 24h Price Change: ${priceChange24h.toFixed(2)}%
- Snowball Score: ${snowball.score}/100
- Phase: ${snowball.phase}
- Score breakdown: Market ${snowball.breakdown.market}, Social ${snowball.breakdown.social}, Treasury ${snowball.breakdown.treasury}, Momentum ${snowball.breakdown.momentum}
- Post threshold: ${snowball.postThreshold}
${milestoneCrossed ? `- MILESTONE CROSSED: $${milestoneCrossed.toLocaleString()} market cap confirmed!` : ''}
- Recent posts (last 3): ${recentPosts.length ? recentPosts.join(' | ') : 'none'}

Based on this data, should I post on X right now? If yes, provide the post content.

Respond with JSON:
{
  "shouldPost": boolean,
  "postContent": "string or null",
  "reasoning": "1-2 sentence explanation",
  "confidence": 0-100,
  "mode": "WATCH|BUILD|IGNITE|ESCALATE"
}
`.trim()

  try {
    const res = await fetch(BANKR_LLM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BANKR_LLM_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) throw new Error(`Bankr LLM error: ${res.status}`)
    const data = await res.json()
    const text = data.content?.[0]?.text ?? ''
    return JSON.parse(text) as AgentDecision
  } catch (err) {
    console.error('[bankr] getAgentDecision error:', err)
    return {
      shouldPost: false,
      postContent: null,
      reasoning: 'LLM unavailable — defaulting to no post.',
      confidence: 0,
      mode: snowball.phase,
    }
  }
}
