import { useEffect, useState } from 'react'
import { supabase, type GardenNode, type Connection } from '../lib/supabase'

interface Props {
  node: GardenNode
  allNodes: GardenNode[]
  connections: Connection[]
  connectMode: boolean
  userName: string | null
  onClose: () => void
  onStartConnect: () => void
}

export default function DetailPanel({
  node, allNodes, connections, connectMode, userName, onClose, onStartConnect,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const myConnections = connections.filter(
    c => c.from_node_id === node.id || c.to_node_id === node.id
  )
  const connectedEntries = myConnections.map(c => {
    const otherId = c.from_node_id === node.id ? c.to_node_id : c.from_node_id
    const other = allNodes.find(n => n.id === otherId)
    return { conn: c, other }
  }).filter(e => e.other) as { conn: Connection; other: GardenNode }[]

  const isOwner = userName && node.created_by === userName

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleDeleteNode() {
    setDeleting(true)
    // Delete all connections involving this node first
    await supabase.from('connections').delete()
      .or(`from_node_id.eq.${node.id},to_node_id.eq.${node.id}`)
    await supabase.from('nodes').delete().eq('id', node.id)
    onClose()
  }

  async function handleUnlink(connId: string) {
    await supabase.from('connections').delete().eq('id', connId)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-20"
        style={{ pointerEvents: connectMode ? 'none' : 'auto' }}
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-80 z-30 bg-[#F5F1E8] border-l border-[#C9C3B5] shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#C9C3B5]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#8B8378] font-light uppercase tracking-wider">
                {node.type}
              </span>
              <h3 className="text-base font-light text-[#2A2520] mt-0.5 leading-snug">
                {node.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#A9A39D] hover:text-[#2A2520] text-xl leading-none flex-shrink-0 cursor-pointer mt-0.5"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-[#8B8378] font-light mt-2">added by {node.created_by}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {node.description && (
            <p className="text-sm font-light text-[#4A4540] leading-relaxed">
              {node.description}
            </p>
          )}

          {node.external_url && (
            <a
              href={node.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-[#8B8378] underline underline-offset-2 hover:text-[#2A2520] break-all"
            >
              {node.external_url}
            </a>
          )}

          {/* Connections */}
          <div>
            <p className="text-xs text-[#8B8378] font-light uppercase tracking-wider mb-2">
              Connections ({connectedEntries.length})
            </p>
            {connectedEntries.length === 0 ? (
              <p className="text-xs text-[#A9A39D] font-light">None yet</p>
            ) : (
              <ul className="space-y-2">
                {connectedEntries.map(({ conn, other }) => (
                  <li key={conn.id} className="flex items-start justify-between gap-2 group">
                    <span className="flex items-start gap-2 text-sm font-light text-[#4A4540] min-w-0">
                      <span className="text-[#C9C3B5] mt-px flex-shrink-0">—</span>
                      <span className="truncate">{other.title}</span>
                    </span>
                    {userName && conn.created_by === userName && (
                      <button
                        onClick={() => handleUnlink(conn.id)}
                        title="Unlink"
                        className="flex-shrink-0 text-[#C9C3B5] hover:text-[#8B8378] text-sm leading-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#C9C3B5] space-y-2">
          <button
            onClick={onStartConnect}
            disabled={connectMode}
            className="w-full py-2 text-sm font-light text-[#2A2520] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {connectMode ? 'Click another object…' : 'Link to another object'}
          </button>

          {isOwner && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2 text-sm font-light text-[#A9A39D] hover:text-red-400 border border-[#C9C3B5] rounded hover:border-red-300 transition-colors cursor-pointer"
            >
              Delete this object
            </button>
          )}

          {isOwner && confirmDelete && (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 text-sm font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNode}
                disabled={deleting}
                className="flex-1 py-2 text-sm font-light text-white bg-red-400 hover:bg-red-500 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
