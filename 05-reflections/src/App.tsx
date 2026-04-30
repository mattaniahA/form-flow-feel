import { useState, useMemo } from 'react'
import ArcCanvas, { ARC_NODES, ZONE_RADIUS } from './components/ArcCanvas'
import NodeObject, { nodeCanvasPos } from './components/NodeObject'
import ConnectionLines from './components/ConnectionLines'
import NameModal from './components/NameModal'
import AddNodeModal from './components/AddNodeModal'
import DetailPanel from './components/DetailPanel'
import { useGardenData } from './hooks/useGardenData'
import { supabase, type ArcNode, type GardenNode } from './lib/supabase'

function computeSpreadPositions(nodes: GardenNode[]): Map<string, { x: number; y: number }> {
  const MIN_DIST = 46
  const pos = new Map(nodes.map(n => [n.id, { ...nodeCanvasPos(n) }]))
  const ids = nodes.map(n => n.id)

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

  const posMap = useMemo(() => computeSpreadPositions(nodes), [nodes])
  const selectedNode = selectedNodeId ? (nodes.find(n => n.id === selectedNodeId) ?? null) : null

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

      {connectMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-[#2A2520] text-[#F5F1E8] text-sm font-light px-5 py-2 rounded-full shadow-lg pointer-events-none">
          Click another object to connect — Escape to cancel
        </div>
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
            pos={posMap.get(node.id) ?? { x: 800, y: 460 }}
            onHoverChange={setHoveredNodeId}
          />
        ))}
      </ArcCanvas>

      {selectedNode && (
        <DetailPanel
          node={selectedNode}
          allNodes={nodes}
          connections={connections}
          connectMode={connectMode}
          userName={userName}
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
