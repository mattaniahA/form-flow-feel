import { useState, useMemo } from 'react'
import ArcCanvas, { ARC_NODES, ZONE_RADIUS, PENTAGON_CENTER, STUDENT_RING_R } from './components/ArcCanvas'
import NodeObject, { nodeCanvasPos } from './components/NodeObject'
import ConnectionLines from './components/ConnectionLines'
import NameModal from './components/NameModal'
import AddNodeModal from './components/AddNodeModal'
import DetailPanel from './components/DetailPanel'
import SettingsPanel from './components/SettingsPanel'
import ActivityLog from './components/ActivityLog'
import { useGardenData } from './hooks/useGardenData'
import { supabase, type ArcNode, type GardenNode } from './lib/supabase'

const ADMIN_NAME = import.meta.env.VITE_ADMIN_NAME as string | undefined

function computeSpreadPositions(nodes: GardenNode[]): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>()

  // Students get evenly spaced slots around the outer ring, sorted by title
  const students = nodes.filter(n => n.is_student).sort((a, b) => a.title.localeCompare(b.title))
  students.forEach((n, i) => {
    const angle = (i / students.length) * 2 * Math.PI - Math.PI / 2
    pos.set(n.id, {
      x: PENTAGON_CENTER.x + STUDENT_RING_R * Math.cos(angle),
      y: PENTAGON_CENTER.y + STUDENT_RING_R * Math.sin(angle),
    })
  })

  // Non-students use the existing spread simulation
  const MIN_DIST = 46
  const others = nodes.filter(n => !n.is_student)
  for (const n of others) pos.set(n.id, { ...nodeCanvasPos(n) })
  const ids = others.map(n => n.id)

  for (let iter = 0; iter < 80; iter++) {
    let anyMoved = false
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])!
        const b = pos.get(ids[j])!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        if (dist < MIN_DIST) {
          let nx: number, ny: number
          if (dist < 0.5) {
            const angle = i * 2.399
            nx = Math.cos(angle); ny = Math.sin(angle)
          } else {
            nx = dx / dist; ny = dy / dist
          }
          const push = (MIN_DIST - dist) / 2 + 0.5
          pos.set(ids[i], { x: a.x - nx * push, y: a.y - ny * push })
          pos.set(ids[j], { x: b.x + nx * push, y: b.y + ny * push })
          anyMoved = true
        }
      }
    }
    if (!anyMoved) break
  }

  return pos
}

type PendingClick = { arcNode: ArcNode | null; x: number; y: number }

function nearestArcNode(canvasX: number, canvasY: number): ArcNode {
  let bestId: ArcNode = ARC_NODES[0].id as ArcNode
  let bestDist = Infinity
  for (const node of ARC_NODES) {
    const dist = Math.hypot(canvasX - node.x, canvasY - node.y)
    if (dist < bestDist) { bestDist = dist; bestId = node.id as ArcNode }
  }
  return bestId
}

function toZoneRelative(canvasX: number, canvasY: number, arcNodeId: ArcNode) {
  const arc = ARC_NODES.find(a => a.id === arcNodeId)!
  const span = ZONE_RADIUS * 1.5
  return {
    x: Math.min(0.95, Math.max(0.05, (canvasX - arc.x) / span + 0.5)),
    y: Math.min(0.95, Math.max(0.05, (canvasY - arc.y) / span + 0.5)),
  }
}

export default function App() {
  const { nodes, connections } = useGardenData()
  const [userName, setUserName] = useState<string | null>(
    () => localStorage.getItem('garden_name')
  )
  const [pending, setPending] = useState<PendingClick | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const posMap = useMemo(() => computeSpreadPositions(nodes), [nodes])

  const richnessMap = useMemo(() => {
    const connCount = new Map<string, number>()
    for (const c of connections) {
      connCount.set(c.from_node_id, (connCount.get(c.from_node_id) ?? 0) + 1)
      connCount.set(c.to_node_id, (connCount.get(c.to_node_id) ?? 0) + 1)
    }
    return new Map(nodes.map(n => {
      const score = (n.description ? 1 : 0) + (n.external_url ? 1 : 0) + (connCount.get(n.id) ?? 0)
      return [n.id, Math.min(score / 6, 1)]
    }))
  }, [nodes, connections])
  const selectedNode = selectedNodeId ? (nodes.find(n => n.id === selectedNodeId) ?? null) : null
  const isAdmin = !!(ADMIN_NAME && userName === ADMIN_NAME)

  function handleCanvasClick() {
    if (connectMode) {
      setConnectMode(false)
      setConnectSourceId(null)
    }
  }

  function handleCanvasDoubleClick(canvasX: number, canvasY: number) {
    if (!userName || connectMode) return
    const arcNode = nearestArcNode(canvasX, canvasY)
    const { x, y } = toZoneRelative(canvasX, canvasY, arcNode)
    setPending({ arcNode, x, y })
  }

  function handleNodeClick(node: GardenNode) {
    if (connectMode && connectSourceId) {
      if (node.id !== connectSourceId) {
        supabase.from('connections').insert({
          from_node_id: connectSourceId,
          to_node_id: node.id,
          created_by: userName ?? 'anonymous',
        }).then(({ error }) => {
          if (error) console.error('Connection failed:', error)
        })
      }
      setConnectMode(false)
      setConnectSourceId(null)
      return
    }
    setSelectedNodeId(node.id)
  }

  function handleStartConnect() {
    if (!selectedNode) return
    setConnectSourceId(selectedNode.id)
    setConnectMode(true)
  }

  function closePanel() {
    setSelectedNodeId(null)
    setConnectMode(false)
    setConnectSourceId(null)
  }

  return (
    <>
      {!userName && <NameModal onSubmit={setUserName} />}

      <ActivityLog nodes={nodes} connections={connections} />

      {connectMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-[#2A2520] text-[#F5F1E8] text-sm font-light px-5 py-2 rounded-full shadow-lg pointer-events-none">
          Click another object to connect — Escape to cancel
        </div>
      )}

      {/* Settings — bottom-right */}
      <button
        onClick={() => setShowSettings(s => !s)}
        className="fixed bottom-5 right-5 z-10 px-3 py-1.5 text-xs font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {isAdmin ? '⚙ admin' : '⚙ settings'}
      </button>

      {showSettings && userName && (
        <SettingsPanel
          userName={userName}
          isAdmin={isAdmin}
          onNameChange={name => { setUserName(name); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}

      <ArcCanvas onCanvasClick={handleCanvasClick} onCanvasDoubleClick={handleCanvasDoubleClick} connectMode={connectMode}>
        <ConnectionLines
          connections={connections}
          nodes={nodes}
          posMap={posMap}
          hoveredNodeId={hoveredNodeId}
        />
        {nodes.map(node => (
          <NodeObject
            key={node.id}
            node={node}
            onClick={handleNodeClick}
            isConnectSource={node.id === connectSourceId}
            connectMode={connectMode}
            pos={posMap.get(node.id) ?? { x: 900, y: 600 }}
            onHoverChange={setHoveredNodeId}
          />
        ))}
        {/* Hover label rendered last so it always paints above all nodes */}
        {hoveredNodeId && (() => {
          const node = nodes.find(n => n.id === hoveredNodeId)
          const pos = posMap.get(hoveredNodeId)
          if (!node || !pos) return null
          const label = node.title.length > 30 ? node.title.slice(0, 28) + '…' : node.title
          return (
            <text
              x={pos.x}
              y={pos.y - 26}
              textAnchor="middle"
              fontSize={11}
              fontWeight={400}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#2A2520"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {label}
            </text>
          )
        })()}
      </ArcCanvas>

      {selectedNode && (
        <DetailPanel
          node={selectedNode}
          allNodes={nodes}
          connections={connections}
          connectMode={connectMode}
          userName={userName}
          isAdmin={isAdmin}
          onClose={closePanel}
          onStartConnect={handleStartConnect}
        />
      )}

      {pending && userName && (
        <AddNodeModal
          initialArcNode={pending.arcNode}
          clickX={pending.x}
          clickY={pending.y}
          createdBy={userName}
          onClose={() => setPending(null)}
        />
      )}
    </>
  )
}
