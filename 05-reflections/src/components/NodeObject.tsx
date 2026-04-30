import { useState } from 'react'
import { ARC_NODES, ZONE_RADIUS, STUDENT_RING_R, PENTAGON_CENTER } from './ArcCanvas'
import type { GardenNode } from '../lib/supabase'

const TYPE_COLORS: Record<GardenNode['type'], string> = {
  project: '#C4856E',
  person:  '#6B9AB8',
  topic:   '#7B9060',
}

function idHash(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function pickColor(_id: string, type: GardenNode['type']): string {
  return TYPE_COLORS[type]
}

export function nodeCanvasPos(node: GardenNode): { x: number; y: number } {
  const hash = idHash(node.id)
  const nx = node.x ?? ((hash * 17) % 97) / 97
  const ny = node.y ?? ((hash * 31) % 97) / 97

  if (node.is_student) {
    const angle = ((hash * 137) % 360) * (Math.PI / 180)
    const rJitter = ((hash * 7) % 20) - 10
    const r = STUDENT_RING_R + rJitter
    return {
      x: PENTAGON_CENTER.x + r * Math.cos(angle),
      y: PENTAGON_CENTER.y + r * Math.sin(angle),
    }
  }

  if (!node.arc_node) {
    return {
      x: PENTAGON_CENTER.x + (nx - 0.5) * 120,
      y: PENTAGON_CENTER.y + (ny - 0.5) * 120,
    }
  }

  const arcNode = ARC_NODES.find(a => a.id === node.arc_node)!
  return {
    x: arcNode.x + (nx - 0.5) * ZONE_RADIUS * 1.5,
    y: arcNode.y + (ny - 0.5) * ZONE_RADIUS * 1.5,
  }
}

function Flower({ color }: { color: string }) {
  const petals = 6
  return (
    <>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx={0} cy={-10}
          rx={5} ry={8}
          fill={color}
          transform={`rotate(${(i / petals) * 360})`}
        />
      ))}
      <circle r={6} fill={color} />
    </>
  )
}

function PersonCircle({ color, initial }: { color: string; initial: string }) {
  return (
    <>
      <circle r={13} fill={color} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
        fill="white"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {initial}
      </text>
    </>
  )
}


function Leaf({ color, angle }: { color: string; angle: number }) {
  return (
    <g transform={`rotate(${angle})`}>
      <path
        d="M 0,-13 C 10,-5 10,5 0,13 C -10,5 -10,-5 0,-13"
        fill={color}
      />
    </g>
  )
}

interface Props {
  node: GardenNode
  onClick?: (node: GardenNode) => void
  isConnectSource?: boolean
  connectMode?: boolean
  pos: { x: number; y: number }
  onHoverChange?: (id: string | null) => void
}

export default function NodeObject({ node, onClick, isConnectSource, connectMode, pos, onHoverChange }: Props) {
  const [hovered, setHovered] = useState(false)
  const { x, y } = pos
  const color = pickColor(node.id, node.type)
  const hash = idHash(node.id)
  const leafAngle = (hash * 97) % 180

  const initial = node.title.trim()[0]?.toUpperCase() ?? '?'
  const cursor = connectMode ? 'crosshair' : 'pointer'

  return (
    <g
      transform={`translate(${x} ${y}) scale(${hovered ? 1.25 : 1})`}
      style={{ cursor, transition: 'transform 0.15s ease' }}
      onMouseDown={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
      onMouseEnter={() => { setHovered(true); onHoverChange?.(node.id) }}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(null) }}
      onClick={() => onClick?.(node)}
    >
      {isConnectSource && (
        <circle r={22} fill="none" stroke="#3A3020" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.5} />
      )}
      {node.type === 'project' && <Flower color={color} />}
      {node.type === 'person'  && <PersonCircle color={color} initial={initial} />}
      {node.type === 'topic'   && <Leaf color={color} angle={leafAngle} />}

    </g>
  )
}
