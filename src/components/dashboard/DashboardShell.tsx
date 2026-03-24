'use client'
import { useEffect, useState } from 'react'
import styles from './DashboardShell.module.css'

interface DashboardData {
  state: {
    mode: string
    market_cap: number
    formatted_cap: string
    snowball_score: number
    last_market_check: string
  } | null
  snowball: {
    score: number
    phase: string
    delta: number
    breakdown: { market: number; social: number; treasury: number; momentum: number }
  } | null
  milestones: Array<{ milestone: number; announced: boolean; confirmed_at: string }>
  decisions: Array<{ should_post: boolean; reasoning: string; confidence: number; created_at: string }>
  posts: Array<{ content: string; posted_at: string; tweet_id: string }>
}

const MILESTONE_TARGETS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000]

function formatMC(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

export function DashboardShell() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/agent/state')
        if (res.ok) setData(await res.json())
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [])

  const confirmedMilestones = new Set((data?.milestones ?? []).map((m) => m.milestone))

  return (
    <div className={styles.shell}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLabel}>TOKEN INTELLIGENCE TERMINAL</span>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            LIVE
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerLabel}>{process.env.TOKEN_NAME ?? 'REACHR'} — ${process.env.TOKEN_TICKER ?? 'RCHR'}</span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Top stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>MARKET CAP</div>
            <div className={`${styles.statVal} ${styles.green}`}>
              {loading ? '—' : (data?.state?.formatted_cap ?? '$0')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>AGENT MODE</div>
            <div className={`${styles.statVal} ${styles.amber}`}>
              {loading ? '—' : (data?.state?.mode ?? 'WATCH')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>SNOWBALL SCORE</div>
            <div className={`${styles.statVal} ${styles.green}`}>
              {loading ? '—' : `${data?.snowball?.score ?? 0} / 100`}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>PHASE</div>
            <div className={styles.statVal}>
              {loading ? '—' : (data?.snowball?.phase ?? 'WATCH')}
            </div>
          </div>
        </div>

        {/* Snowball breakdown */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>SNOWBALL BREAKDOWN</div>
          <div className={styles.scoreBar}>
            <div className={styles.scoreBarFill} style={{ width: `${data?.snowball?.score ?? 0}%` }} />
          </div>
          <div className={styles.breakdown}>
            {['market', 'social', 'treasury', 'momentum'].map((k) => (
              <div key={k} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{k.toUpperCase()}</span>
                <span className={styles.breakdownVal}>
                  {data?.snowball?.breakdown?.[k as keyof typeof data.snowball.breakdown] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone ladder */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>MILESTONE LADDER</div>
          <div className={styles.milestones}>
            {MILESTONE_TARGETS.map((m) => {
              const reached = confirmedMilestones.has(m)
              const currentMC = data?.state?.market_cap ?? 0
              const isCurrent = !reached && currentMC < m &&
                (MILESTONE_TARGETS[MILESTONE_TARGETS.indexOf(m) - 1] <= currentMC || m === MILESTONE_TARGETS[0])
              return (
                <div
                  key={m}
                  className={`${styles.milestone} ${reached ? styles.reached : ''} ${isCurrent ? styles.current : ''}`}
                >
                  <div className={styles.milestoneDot} />
                  <div className={styles.milestoneLabel}>{formatMC(m)}</div>
                  {reached && <div className={styles.milestoneBadge}>✓</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>ACTIVITY LOG</div>
          <div className={styles.feed}>
            {loading && <div className={styles.feedEmpty}>Loading...</div>}
            {!loading && (data?.decisions ?? []).length === 0 && (
              <div className={styles.feedEmpty}>No activity yet — waiting for first market check.</div>
            )}
            {(data?.decisions ?? []).map((d, i) => (
              <div key={i} className={styles.feedItem}>
                <span className={styles.feedTime}>
                  {new Date(d.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={styles.feedText}>
                  <span className={d.should_post ? styles.green : styles.muted}>
                    {d.should_post ? 'POST' : 'HOLD'}
                  </span>
                  {' — '}{d.reasoning}
                </span>
                {d.confidence > 0 && (
                  <span className={styles.feedTag}>{d.confidence}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>RECENT POSTS</div>
          <div className={styles.feed}>
            {(data?.posts ?? []).length === 0 && (
              <div className={styles.feedEmpty}>No posts yet — agent is observing.</div>
            )}
            {(data?.posts ?? []).map((p, i) => (
              <div key={i} className={styles.feedItem}>
                <span className={styles.feedTime}>
                  {new Date(p.posted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={styles.feedText}>{p.content}</span>
                {p.tweet_id && (
                  <a
                    href={`https://x.com/i/web/status/${p.tweet_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.feedTag}
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CMD line */}
        <div className={styles.cmdLine}>
          <span className={styles.cmdPrompt}>RCHR&gt;</span>
          <span className={styles.cmdText}>
            {loading
              ? 'loading state...'
              : `agent ${data?.state?.mode?.toLowerCase() ?? 'inactive'} — score ${data?.snowball?.score ?? 0}/100 — phase ${data?.snowball?.phase ?? 'WATCH'}`}
          </span>
          <span className={styles.cursor} />
        </div>
      </div>
    </div>
  )
}
