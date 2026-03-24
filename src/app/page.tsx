import { Topbar } from '@/components/landing/Topbar'
import { LeftPanel } from '@/components/landing/LeftPanel'
import { TVMonitor } from '@/components/landing/TVMonitor'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <main style={{ display: 'grid', gridTemplateColumns: '400px 1fr', flex: 1 }}>
        <LeftPanel />
        <TVMonitor />
      </main>
    </div>
  )
}
