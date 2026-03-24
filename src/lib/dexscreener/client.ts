const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex'

export interface PairData {
  pairAddress: string
  baseToken: { address: string; name: string; symbol: string }
  quoteToken: { address: string; name: string; symbol: string }
  priceUsd: string
  priceNative: string
  volume: { h24: number; h6: number; h1: number; m5: number }
  liquidity: { usd: number; base: number; quote: number }
  fdv: number
  marketCap: number
  pairCreatedAt: number
  txns: { h24: { buys: number; sells: number } }
}

export async function getPairData(pairAddress: string): Promise<PairData | null> {
  try {
    const res = await fetch(`${DEXSCREENER_BASE}/pairs/base/${pairAddress}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.pair ?? data.pairs?.[0] ?? null
  } catch (err) {
    console.error('[dexscreener] getPairData error:', err)
    return null
  }
}

export async function getMarketCap(pairAddress: string): Promise<number> {
  const pair = await getPairData(pairAddress)
  return pair?.marketCap ?? 0
}

export function formatMarketCap(mc: number): string {
  if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(2)}M`
  if (mc >= 1_000) return `$${(mc / 1_000).toFixed(1)}K`
  return `$${mc.toFixed(0)}`
}
