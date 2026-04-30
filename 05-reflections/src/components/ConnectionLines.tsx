import type { GardenNode, Connection } from '../lib/supabase'

function bezierPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perp = Math.min(60, len * 0.25)
  const cx = mx - (dy / len) * perp
  const cy = my + (dx / len) * perp
  return `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`
}

interface Props {
  connections: Connection[]
  nodes: GardenNode[]
  posMap: Map<string, { x: number; y: number }>
  hoveredNodeId: string | null
}

export default function ConnectionLines({ connections, nodes, posMap, hoveredNodeId }: Props) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  return (
    <>
      {connections.map(conn => {
        const from = nodeMap.get(conn.from_node_id)
        const to   = nodeMap.get(conn.to_node_id)
        if (!from || !to) return null
        const fromPos = posMap.get(from.id)
        const toPos   = posMap.get(to.id)
        if (!fromPos || !toPos) return null

        const isHighlighted = hoveredNodeId !== null && (
          conn.from_node_id === hoveredNodeId || conn.to_node_id === hoveredNodeId
        )
        const opacity = isHighlighted ? 0.65 : hoveredNodeId ? 0.04 : 0.06

        return (
          <path
            key={conn.id}
            d={bezierPath(fromPos, toPos)}
            fill="none"
            stroke="#6B5A3A"
            strokeWidth={isHighlighted ? 1.2 : 0.7}
            opacity={opacity}
            strokeLinecap="round"
            style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
          />
        )
      })}
    </>
  )
}
