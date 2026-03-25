import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'REACHR',
  description: 'Autonomous single-token growth agent. Signal-driven.',
  openGraph: {
    title: 'REACHR',
    description: 'The agent behind the reach',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
