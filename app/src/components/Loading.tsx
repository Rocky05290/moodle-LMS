import { Card } from './ui'

export default function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <Card className="flex items-center justify-center gap-3 p-12 text-[13px] font-semibold text-ink-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      {label}
    </Card>
  )
}
