'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from './TVMonitor.module.css'

const CAPS = ['$84.2K', '$84.5K', '$83.9K', '$85.1K', '$84.8K']
const CMDS = [
  'awaiting next cycle',
  'reading pair data...',
  'vol delta: +18.4%',
  'score recalc...',
  'hold — threshold 72+ needed',
  'next check in 4m',
]
const FEED_ITEMS = [
  { time: '02:19', text: 'CYCLE — new market read started', hl: true },
  { time: '02:24', text: 'Cap: $85.1K | momentum building', hl: false },
  { time: '02:29', text: 'Score: 67 → 68', hl: true, tag: 'UPDATE' },
]

type FeedItem = { time: string; text: string; hl?: boolean; tag?: string }

export function TVMonitor() {
  const [mcap, setMcap] = useState('$84.2K')
  const [countdown, setCountdown] = useState(277)
  const [cmd, setCmd] = useState(CMDS[0])
  const [feed, setFeed] = useState<FeedItem[]>([
    { time: '02:14', text: 'SIGNAL — vol spike +18%', hl: true, tag: 'WATCH' },
    { time: '02:09', text: 'Score updated: 64 → 67', hl: true },
    { time: '01:54', text: 'Cap: $84.2K | Liq: $31K', hl: false },
  ])

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((s) => (s <= 0 ? 300 : s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Mcap drift
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % CAPS.length
      setMcap(CAPS[i])
    }, 3500)
    return () => clearInterval(t)
  }, [])

  // CMD cycling
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % CMDS.length
      setCmd(CMDS[i])
    }, 4000)
    return () => clearInterval(t)
  }, [])

  // Feed updates
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      const item = FEED_ITEMS[i % FEED_ITEMS.length]
      setFeed((prev) => [item, ...prev].slice(0, 5))
      i++
    }, 5500)
    return () => clearInterval(t)
  }, [])

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60
  const cdStr = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <section className={styles.right}>
      <div className={styles.ambient} />
      <div className={styles.tvOuter}>
        <div className={styles.tvBody}>
          <div className={styles.tvBezel}>
            <div className={styles.tvScreen}>
              <div className={styles.glare} />

              {/* Screen top bar */}
              <div className={styles.scrBar}>
                <div className={styles.scrLogo}>
                  <Image src="/tv-logo.png" alt="R" width={18} height={18} style={{ borderRadius: 3, objectFit: 'cover' }} />
                  REACHR
                </div>
                <div className={styles.scrLive}>
                  <span className={styles.scrLiveDot} />
                  SIGNAL ACTIVE
                </div>
              </div>

              {/* Orb area */}
              <div className={styles.orbArea}>
                <div className={`${styles.orbitRing} ${styles.or2}`}>
                  <div className={`${styles.orbDot} ${styles.od2}`} />
                </div>
                <div className={`${styles.orbitRing} ${styles.or1}`}>
                  <div className={`${styles.orbDot} ${styles.od1}`} />
                </div>
                <div className={styles.orb} />
              </div>

              {/* Snowball score */}
              <div className={styles.scoreSection}>
                <div className={styles.scoreHdr}>
                  <span className={styles.scoreLbl}>SNOWBALL SCORE</span>
                  <span className={styles.scoreVal}>67 / 100</span>
                </div>
                <div className={styles.scoreTrack}>
                  <div className={styles.scoreFill} />
                </div>
              </div>

              {/* Stats */}
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statLbl}>MCAP</div>
                  <div className={`${styles.statVal} ${styles.green}`}>{mcap}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLbl}>MODE</div>
                  <div className={`${styles.statVal} ${styles.amber}`}>BUILDING</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLbl}>NEXT CHECK</div>
                  <div className={styles.statVal}>{cdStr}</div>
                </div>
              </div>

              {/* Activity feed */}
              <div className={styles.feed}>
                {feed.map((item, idx) => (
                  <div key={idx} className={styles.feedItem}>
                    <span className={styles.feedTime}>{item.time}</span>
                    <span className={styles.feedTxt}>
                      <span className={item.hl ? styles.hl : ''}>{item.text}</span>
                      {item.tag && <span className={styles.tag}>{item.tag}</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Command line */}
              <div className={styles.cmd}>
                <span className={styles.cmdPrompt}>RCHR&gt;</span>
                <span className={styles.cmdTxt}>{cmd}</span>
                <span className={styles.cursor} />
              </div>

              {/* Token row */}
              <div className={styles.tokenRow}>
                <Image src="/tv-logo.png" alt="R" width={20} height={20} style={{ borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover', flexShrink: 0 }} />
                <div className={styles.tokInfo}>
                  <div className={styles.tokName}>REACHR — $RCHR</div>
                  <div className={styles.tokAddr}>
                    {process.env.NEXT_PUBLIC_APP_URL
                      ? '0x4d94c4c70c8f971…'
                      : '0x4d94c4c70c8f971…'}{' '}
                    · AGENT ACTIVE
                  </div>
                </div>
                <div className={styles.tokActions}>
                  <div className={styles.tokBtn}>BUY</div>
                  <div className={styles.tokBtn}>X</div>
                  <div className={styles.tokBtn}>COPY</div>
                </div>
              </div>
            </div>
          </div>

          {/* TV Controls bar */}
          <div className={styles.controls}>
            <div className={styles.power}>
              <div className={styles.powerLed} />
            </div>
            <div className={styles.brand}>REACHR</div>
            <div className={styles.knobsRow}>
              <div className={styles.speaker}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.speakerLine} />
                ))}
              </div>
              <div className={styles.knob} />
              <div className={styles.knob} />
            </div>
          </div>
        </div>

        {/* Legs */}
        <div className={styles.legs}>
          <div className={styles.leg} />
          <div className={styles.leg} />
        </div>
      </div>
    </section>
  )
}
