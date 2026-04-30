import { useEffect, useRef, useState } from 'react'
import type { GardenNode, Connection } from '../lib/supabase'

interface LogEntry {
  id: string
  text: string
  at: Date
}

function relTime(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function buildInitialEntries(nodes: GardenNode[], connections: Connection[]): LogEntry[] {
  const all: LogEntry[] = [
    ...nodes.map(n => ({
      id: `n-${n.id}`,
      text: `${n.created_by} added "${n.title}"`,
      at: new Date(n.created_at),
    })),
    ...connections.map(c => ({
      id: `c-${c.id}`,
      text: `${c.created_by} linked "${nodes.find(n => n.id === c.from_node_id)?.title ?? '?'}" → "${nodes.find(n => n.id === c.to_node_id)?.title ?? '?'}"`,
      at: new Date(c.created_at),
    })),
  ]
  all.sort((a, b) => b.at.getTime() - a.at.getTime())
  return all.slice(0, 6)
}

function useActivityLog(nodes: GardenNode[], connections: Connection[]) {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const seenNodes = useRef<Set<string> | null>(null)
  const seenConns = useRef<Set<string> | null>(null)
  const nodesRef = useRef(nodes)

  useEffect(() => { nodesRef.current = nodes }, [nodes])

  useEffect(() => {
    if (seenNodes.current === null) {
      seenNodes.current = new Set(nodes.map(n => n.id))
      // connections already seeded — both are ready, populate from DB history
      if (seenConns.current !== null) setEntries(buildInitialEntries(nodes, connections))
      return
    }
    const fresh: LogEntry[] = []
    for (const n of nodes) {
      if (!seenNodes.current.has(n.id)) {
        seenNodes.current.add(n.id)
        fresh.push({ id: `n-${n.id}`, text: `${n.created_by} added "${n.title}"`, at: new Date(n.created_at) })
      }
    }
    if (fresh.length) setEntries(prev => [...fresh, ...prev].slice(0, 6))
  }, [nodes])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (seenConns.current === null) {
      seenConns.current = new Set(connections.map(c => c.id))
      // nodes already seeded — both are ready, populate from DB history
      if (seenNodes.current !== null) setEntries(buildInitialEntries(nodes, connections))
      return
    }
    const fresh: LogEntry[] = []
    for (const c of connections) {
      if (!seenConns.current.has(c.id)) {
        seenConns.current.add(c.id)
        const ns = nodesRef.current
        const from = ns.find(n => n.id === c.from_node_id)?.title ?? '?'
        const to   = ns.find(n => n.id === c.to_node_id)?.title ?? '?'
        fresh.push({ id: `c-${c.id}`, text: `${c.created_by} linked "${from}" → "${to}"`, at: new Date(c.created_at) })
      }
    }
    if (fresh.length) setEntries(prev => [...fresh, ...prev].slice(0, 6))
  }, [connections])  // eslint-disable-line react-hooks/exhaustive-deps

  return entries
}

interface Props {
  nodes: GardenNode[]
  connections: Connection[]
}

export default function ActivityLog({ nodes, connections }: Props) {
  const entries = useActivityLog(nodes, connections)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  if (entries.length === 0) return null

  return (
    <div className="fixed bottom-5 left-5 z-10 w-56 pointer-events-none select-none">
      <p className="text-[9px] text-[#C9C3B5] font-light uppercase tracking-widest mb-2">recent</p>
      <ul className="space-y-1.5">
        {entries.map(e => (
          <li key={e.id} className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-light text-[#8B8378] leading-snug truncate">{e.text}</span>
            <span className="text-[10px] text-[#C9C3B5] flex-shrink-0 tabular-nums">{relTime(e.at)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
