'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Twitter } from 'lucide-react'
import styles from './Topbar.module.css'

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isDashboard = pathname !== '/'

  return (
    <nav className={styles.topbar}>
      <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
        <Image
          src="/tv-logo.png"
          alt="REACHR"
          width={34}
          height={34}
          className={styles.logoImg}
        />
        <div>
          <div className={styles.logoName}>REACHR</div>
          <div className={styles.logoSub}>AGENT</div>
        </div>
      </div>
      <div className={styles.right}>
        {isDashboard && (
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={13} />
            BACK
          </Link>
        )}
        <a
          href="https://discord.gg/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.icon}
          aria-label="Discord"
        >
          <MessageCircle size={14} />
        </a>
        <a
          href="https://x.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.icon}
          aria-label="X / Twitter"
        >
          <Twitter size={14} />
        </a>
      </div>
    </nav>
  )
}
