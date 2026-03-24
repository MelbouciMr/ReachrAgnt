import { Topbar } from '@/components/landing/Topbar'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <DashboardShell />
    </div>
  )
}
