'use client'
import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp, Share2, Wallet, BarChart2, Droplets, Plus,
  Snowflake, Flag, Zap, ArrowRight
} from 'lucide-react'
import styles from './LeftPanel.module.css'

const NAV_LINKS = [
  { label: 'EXPLORE', href: '/', active: true },
  { label: 'DASHBOARD', href: '/dashboard' },
]

const SIGNAL_LAYERS = [
  { icon: TrendingUp, code: 'MKT', name: 'Market' },
  { icon: Share2, code: 'SOC', name: 'Social' },
  { icon: Wallet, code: 'TRS', name: 'Treasury' },
  { icon: BarChart2, code: 'VOL', name: 'Volume' },
  { icon: Droplets, code: 'LIQ', name: 'Liquidity' },
  { icon: Plus, code: '+', name: 'More' },
]

const FEATURES = [
  { icon: Snowflake, title: 'SNOWBALL', desc: 'Compounds momentum across all signal layers.' },
  { icon: Flag, title: 'MILESTONES', desc: 'Confirms cap milestones before announcing.' },
  { icon: Zap, title: 'PROMO', desc: 'Surfaces boost windows for manual approval.' },
]

export function LeftPanel() {
  return (
    <aside className={styles.left}>
      <div>
        <div className={styles.secLabel}>REACHR INFORMATION</div>
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            Monitor your token&apos;s market behavior, detect momentum, and deploy attention on X —
            only when the signal warrants it.
          </p>
        </div>
        <nav className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${styles.navLink} ${link.active ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div>
        <div className={styles.secLabel}>SIGNAL LAYERS</div>
        <div className={styles.signalGrid}>
          {SIGNAL_LAYERS.map((layer) => {
            const Icon = layer.icon
            return (
              <div key={layer.code} className={styles.signalCell}>
                <span className={styles.scCorner} />
                <span className={styles.scIcon}>
                  <Icon size={10} />
                  {layer.code}
                </span>
                <div className={styles.scName}>{layer.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className={styles.secHeader}>
          <div className={styles.secLabel} style={{ margin: 0 }}>FEATURES</div>
          <div className={styles.comingSoon}>COMING SOON ▣</div>
        </div>
        <div style={{ height: '0.6rem' }} />
        <div className={styles.featGrid}>
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div key={feat.title} className={styles.featCard}>
                <div className={styles.featIcon}><Icon size={13} /></div>
                <div className={styles.featTitle}>{feat.title}</div>
                <div className={styles.featDesc}>{feat.desc}</div>
                <div className={styles.livePill}>
                  <span className={styles.liveDot} />
                  LIVE
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Link href="/dashboard" className={styles.openBtn}>
        OPEN DASHBOARD
        <div className={styles.openBtnArr}><ArrowRight size={13} /></div>
      </Link>
    </aside>
  )
}
