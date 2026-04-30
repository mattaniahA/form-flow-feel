import { useEffect, useState } from 'react'
import { supabase, type GardenNode, type Connection, type NodeType, type ArcNode } from '../lib/supabase'
import { ARC_NODES } from './ArcCanvas'

const TYPE_LABELS: Record<NodeType, string> = {
  project: '❀ project',
  person:  '● person',
  topic:   '◗ idea',
}

interface Props {
  node: GardenNode
  allNodes: GardenNode[]
  connections: Connection[]
  connectMode: boolean
  userName: string | null
  isAdmin?: boolean
  onClose: () => void
  onStartConnect: () => void
}

export default function DetailPanel({
  node, allNodes, connections, connectMode, userName, isAdmin = false, onClose, onStartConnect,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [editType, setEditType]               = useState<NodeType>(node.type)
  const [editTitle, setEditTitle]             = useState(node.title)
  const [editDescription, setEditDescription] = useState(node.description ?? '')
  const [editUrl, setEditUrl]                 = useState(node.external_url ?? '')
  const [editArcNode, setEditArcNode]         = useState<ArcNode | null>(node.arc_node)
  const [editIsStudent, setEditIsStudent]     = useState(node.is_student ?? false)

  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading]       = useState(false)

  // Keep edit fields in sync if the node updates via realtime while not editing
  useEffect(() => {
    if (!editing) {
      setEditType(node.type)
      setEditTitle(node.title)
      setEditDescription(node.description ?? '')
      setEditUrl(node.external_url ?? '')
      setEditArcNode(node.arc_node)
      setEditIsStudent(node.is_student ?? false)
    }
  }, [node, editing])

  const myConnections = connections.filter(
    c => c.from_node_id === node.id || c.to_node_id === node.id
  )
  const connectedEntries = myConnections.map(c => {
    const otherId = c.from_node_id === node.id ? c.to_node_id : c.from_node_id
    const other = allNodes.find(n => n.id === otherId)
    return { conn: c, other }
  }).filter(e => e.other) as { conn: Connection; other: GardenNode }[]

  const isOwner = !!(userName && node.created_by === userName)
  const canEdit = isOwner || isAdmin

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editing) { setEditing(false) } else { onClose() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, editing])

  function startEdit() {
    setEditType(node.type)
    setEditTitle(node.title)
    setEditDescription(node.description ?? '')
    setEditUrl(node.external_url ?? '')
    setEditArcNode(node.arc_node)
    setEditIsStudent(node.is_student ?? false)
    setEditError(null)
    setConfirmDelete(false)
    setImageFile(null)
    setImagePreview(null)
    setUploading(false)
    setEditing(true)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const accepted = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!accepted.includes(file.type)) { setEditError('Only JPEG, PNG, GIF, or WebP accepted.'); return }
    if (file.size > 5 * 1024 * 1024) { setEditError('Image must be under 5 MB.'); return }
    setImageFile(file)
    setEditError(null)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!editTitle.trim()) return
    setSaving(true)
    setEditError(null)

    let newImageUrl = node.image_url
    if (imageFile) {
      setUploading(true)
      const ext = imageFile.name.split('.').pop() ?? 'jpg'
      const { error: upErr } = await supabase.storage
        .from('node-images')
        .upload(`${node.id}/avatar.${ext}`, imageFile, { upsert: true, contentType: imageFile.type })
      setUploading(false)
      if (upErr) { setEditError('Image upload failed. Try again.'); setSaving(false); return }
      const { data } = supabase.storage.from('node-images').getPublicUrl(`${node.id}/avatar.${ext}`)
      newImageUrl = data.publicUrl
    }

    const { error } = await supabase.from('nodes').update({
      type:         editType,
      title:        editTitle.trim().slice(0, 80),
      description:  editDescription.trim() || null,
      external_url: editUrl.trim() || null,
      arc_node:     editArcNode,
      is_student:   editType === 'person' ? editIsStudent : false,
      image_url:    newImageUrl,
    }).eq('id', node.id)
    setSaving(false)
    if (error) { setEditError('Save failed. Try again.'); return }
    setEditing(false)
    setImageFile(null)
    setImagePreview(null)
  }

  async function handleDeleteNode() {
    setDeleting(true)
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
                {editing ? TYPE_LABELS[editType] : TYPE_LABELS[node.type]}
              </span>
              <h3 className="text-base font-light text-[#2A2520] mt-0.5 leading-snug">
                {editing
                  ? (editTitle || <span className="text-[#A9A39D]">Title…</span>)
                  : node.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#A9A39D] hover:text-[#2A2520] text-xl leading-none flex-shrink-0 cursor-pointer mt-0.5"
            >×</button>
          </div>
          <p className="text-xs text-[#8B8378] font-light mt-2">added by {node.created_by}</p>
        </div>

        {editing ? (
          /* ── Edit form ── */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Type */}
            <div>
              <p className="text-xs text-[#8B8378] font-light uppercase tracking-wider mb-1.5">Type</p>
              <div className="flex gap-2">
                {(Object.keys(TYPE_LABELS) as NodeType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={`flex-1 py-1.5 text-xs font-light rounded border transition-colors cursor-pointer
                      ${editType === t
                        ? 'border-[#8B8378] bg-[#EDE9E0] text-[#2A2520]'
                        : 'border-[#C9C3B5] text-[#6B6560] hover:bg-[#EDE9E0]'}`}
                  >{TYPE_LABELS[t]}</button>
                ))}
              </div>
            </div>

            {/* Student toggle — only for person */}
            {editType === 'person' && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editIsStudent}
                  onChange={e => setEditIsStudent(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#8B8378] cursor-pointer"
                />
                <span className="text-sm font-light text-[#4A4540]">student</span>
              </label>
            )}

            {/* Title */}
            <div>
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value.slice(0, 80))}
                placeholder="Title (required)"
                className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378]"
              />
              <p className="text-right text-xs text-[#A9A39D] mt-1">{editTitle.length}/80</p>
            </div>

            {/* Description */}
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value.slice(0, 400))}
              placeholder="Description (optional)"
              rows={4}
              className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378] resize-none"
            />

            {/* URL */}
            <input
              type="url"
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
              placeholder="URL (optional)"
              className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378]"
            />

            {/* Image */}
            <div>
              <p className="text-xs text-[#8B8378] font-light uppercase tracking-wider mb-1.5">
                Image <span className="normal-case text-[#A9A39D]">(optional · max 5 MB)</span>
              </p>
              {(imagePreview ?? node.image_url) && (
                <img
                  src={imagePreview ?? node.image_url!}
                  alt="preview"
                  className="w-full h-32 object-cover rounded mb-2 border border-[#C9C3B5]"
                />
              )}
              <label className="block cursor-pointer">
                <span className="w-full py-1.5 text-xs font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors flex items-center justify-center">
                  {node.image_url || imageFile ? 'Replace image' : 'Upload image'}
                </span>
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={handleImageSelect} />
              </label>
              {uploading && <p className="text-xs text-[#8B8378] mt-1">Uploading…</p>}
            </div>

            {/* Week */}
            <div>
              <p className="text-xs text-[#8B8378] font-light uppercase tracking-wider mb-1.5">
                Week <span className="normal-case text-[#A9A39D]">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ARC_NODES.map(an => (
                  <button
                    key={an.id}
                    type="button"
                    onClick={() => setEditArcNode(editArcNode === an.id ? null : an.id as ArcNode)}
                    className={`px-2.5 py-1 text-xs font-light rounded border transition-colors cursor-pointer
                      ${editArcNode === an.id
                        ? 'border-[#8B8378] bg-[#EDE9E0] text-[#2A2520]'
                        : 'border-[#C9C3B5] text-[#6B6560] hover:bg-[#EDE9E0]'}`}
                  >{an.label}</button>
                ))}
              </div>
            </div>

            {editError && <p className="text-xs text-red-500">{editError}</p>}
          </div>
        ) : (
          /* ── View mode ── */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {node.image_url && (
              <img
                src={node.image_url}
                alt={node.title}
                className="w-full rounded object-cover border border-[#C9C3B5]"
                style={{ maxHeight: '180px' }}
              />
            )}

            {node.type === 'person' && node.is_student && (
              <p className="text-xs text-[#7D9176] font-light tracking-wide">◎ student</p>
            )}

            {node.is_student && !canEdit && (
              <p className="text-xs text-[#A9A39D] font-light italic">
                Enter &ldquo;{node.title}&rdquo; as your name to edit this node.
              </p>
            )}

            {node.description && (
              <p className="text-sm font-light text-[#4A4540] leading-relaxed">{node.description}</p>
            )}

            {node.external_url && (
              <a
                href={/^https?:\/\//i.test(node.external_url) ? node.external_url : `https://${node.external_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#8B8378] underline underline-offset-2 hover:text-[#2A2520] break-all"
              >{node.external_url}</a>
            )}

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
                        >×</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t border-[#C9C3B5] space-y-2">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 text-sm font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || saving}
                className="flex-1 py-2 text-sm font-light text-[#2A2520] border border-[#8B8378] rounded bg-[#EDE9E0] hover:bg-[#E0DAD0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >{saving ? (uploading ? 'Uploading…' : 'Saving…') : 'Save'}</button>
            </div>
          ) : (
            <>
              <button
                onClick={onStartConnect}
                disabled={connectMode}
                className="w-full py-2 text-sm font-light text-[#2A2520] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >{connectMode ? 'Click another object…' : 'Link to another object'}</button>

              {canEdit && (
                <button
                  onClick={startEdit}
                  className="w-full py-2 text-sm font-light text-[#2A2520] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
                >Edit this object</button>
              )}

              {canEdit && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 text-sm font-light text-[#A9A39D] hover:text-red-400 border border-[#C9C3B5] rounded hover:border-red-300 transition-colors cursor-pointer"
                >Delete this object</button>
              )}

              {canEdit && confirmDelete && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 text-sm font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
                  >Cancel</button>
                  <button
                    onClick={handleDeleteNode}
                    disabled={deleting}
                    className="flex-1 py-2 text-sm font-light text-white bg-red-400 hover:bg-red-500 rounded transition-colors disabled:opacity-50 cursor-pointer"
                  >{deleting ? 'Deleting…' : 'Confirm delete'}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
