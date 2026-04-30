import { useEffect, useState } from 'react'
import { supabase, type GardenNode, type Connection, type NodeImage, type NodeType, type ArcNode } from '../lib/supabase'
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

  const [images, setImages]               = useState<NodeImage[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  // Fetch images for this node
  useEffect(() => {
    setImages([])
    setLightboxIndex(null)
    supabase.from('node_images').select('*').eq('node_id', node.id).order('created_at').then(({ data }) => {
      if (data) setImages(data)
    })
  }, [node.id])

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
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') { setLightboxIndex(null); return }
        if (e.key === 'ArrowRight') { setLightboxIndex(i => i !== null && i < images.length - 1 ? i + 1 : i); return }
        if (e.key === 'ArrowLeft')  { setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i); return }
        return
      }
      if (e.key === 'Escape') {
        if (editing) { setEditing(false) } else { onClose() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, editing, lightboxIndex, images.length])

  function startEdit() {
    setEditType(node.type)
    setEditTitle(node.title)
    setEditDescription(node.description ?? '')
    setEditUrl(node.external_url ?? '')
    setEditArcNode(node.arc_node)
    setEditIsStudent(node.is_student ?? false)
    setEditError(null)
    setConfirmDelete(false)
    setEditing(true)
  }

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const accepted = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!accepted.includes(file.type)) { setEditError('Only JPEG, PNG, GIF, or WebP accepted.'); return }
    if (file.size > 5 * 1024 * 1024) { setEditError('Image must be under 5 MB.'); return }
    setEditError(null)
    setImageUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const imgId = crypto.randomUUID()
    const path = `${node.id}/${imgId}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('node-images')
      .upload(path, file, { contentType: file.type })
    if (upErr) { setEditError('Upload failed. Try again.'); setImageUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('node-images').getPublicUrl(path)
    const { data: newImg } = await supabase.from('node_images')
      .insert({ node_id: node.id, url: publicUrl })
      .select().single()
    if (newImg) setImages(prev => [...prev, newImg])
    setImageUploading(false)
  }

  async function handleDeleteImage(img: NodeImage) {
    setDeletingImageId(img.id)
    // Extract storage path from public URL
    const match = img.url.match(/node-images\/(.+)$/)
    if (match) await supabase.storage.from('node-images').remove([match[1]])
    await supabase.from('node_images').delete().eq('id', img.id)
    setImages(prev => {
      const next = prev.filter(i => i.id !== img.id)
      setLightboxIndex(idx => {
        if (idx === null) return null
        const pos = prev.findIndex(i => i.id === img.id)
        if (pos < idx) return idx - 1
        if (pos === idx) return next.length > 0 ? Math.min(idx, next.length - 1) : null
        return idx
      })
      return next
    })
    setDeletingImageId(null)
  }

  async function handleSave() {
    if (!editTitle.trim()) return
    setSaving(true)
    setEditError(null)
    const { error } = await supabase.from('nodes').update({
      type:         editType,
      title:        editTitle.trim().slice(0, 80),
      description:  editDescription.trim() || null,
      external_url: editUrl.trim() || null,
      arc_node:     editArcNode,
      is_student:   editType === 'person' ? editIsStudent : false,
    }).eq('id', node.id)
    setSaving(false)
    if (error) { setEditError('Save failed. Try again.'); return }
    setEditing(false)
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

      <div className="fixed right-0 top-0 h-full w-80 z-30 bg-[#F5F0E4] border-l border-[#D0C8B0] shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#D0C8B0]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#9A9080] font-light uppercase tracking-wider">
                {editing ? TYPE_LABELS[editType] : TYPE_LABELS[node.type]}
              </span>
              <h3 className="text-base font-light text-[#3A3020] mt-0.5 leading-snug">
                {editing
                  ? (editTitle || <span className="text-[#A89880]">Title…</span>)
                  : node.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#A89880] hover:text-[#3A3020] text-xl leading-none flex-shrink-0 cursor-pointer mt-0.5"
            >×</button>
          </div>
          <p className="text-xs text-[#9A9080] font-light mt-2">added by {node.created_by}</p>
        </div>

        {editing ? (
          /* ── Edit form ── */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Type */}
            <div>
              <p className="text-xs text-[#9A9080] font-light uppercase tracking-wider mb-1.5">Type</p>
              <div className="flex gap-2">
                {(Object.keys(TYPE_LABELS) as NodeType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={`flex-1 py-1.5 text-xs font-light rounded border transition-colors cursor-pointer
                      ${editType === t
                        ? 'border-[#6B5A3A] bg-[#EDE5D0] text-[#6B5A3A]'
                        : 'border-[#D0C8B0] text-[#6B6050] hover:bg-[#ECE7D5]'}`}
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
                  className="w-3.5 h-3.5 accent-[#6B5A3A] cursor-pointer"
                />
                <span className="text-sm font-light text-[#5A4A30]">student</span>
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
                className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A]"
              />
              <p className="text-right text-xs text-[#A89880] mt-1">{editTitle.length}/80</p>
            </div>

            {/* Description */}
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value.slice(0, 400))}
              placeholder="Description (optional)"
              rows={4}
              className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A] resize-none"
            />

            {/* URL */}
            <input
              type="url"
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
              placeholder="URL (optional)"
              className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A]"
            />

            {/* Images */}
            <div>
              <p className="text-xs text-[#9A9080] font-light uppercase tracking-wider mb-1.5">
                Images <span className="normal-case text-[#A89880]">(optional · max 5 MB each)</span>
              </p>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map(img => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        className="w-20 h-20 object-cover rounded border border-[#D0C8B0]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img)}
                        disabled={deletingImageId === img.id}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer disabled:opacity-30"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              <label className="block cursor-pointer">
                <span className={`w-full py-1.5 text-xs font-light text-[#6B6050] border border-[#D0C8B0] rounded hover:bg-[#ECE7D5] transition-colors flex items-center justify-center gap-1 ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {imageUploading ? 'Uploading…' : '+ Add image'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="sr-only"
                  onChange={handleAddImage}
                  disabled={imageUploading}
                />
              </label>
            </div>

            {/* Week */}
            <div>
              <p className="text-xs text-[#9A9080] font-light uppercase tracking-wider mb-1.5">
                Week <span className="normal-case text-[#A89880]">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ARC_NODES.map(an => (
                  <button
                    key={an.id}
                    type="button"
                    onClick={() => setEditArcNode(editArcNode === an.id ? null : an.id as ArcNode)}
                    className={`px-2.5 py-1 text-xs font-light rounded border transition-colors cursor-pointer
                      ${editArcNode === an.id
                        ? 'border-[#6B5A3A] bg-[#EDE5D0] text-[#6B5A3A]'
                        : 'border-[#D0C8B0] text-[#6B6050] hover:bg-[#ECE7D5]'}`}
                  >{an.label}</button>
                ))}
              </div>
            </div>

            {editError && <p className="text-xs text-red-500">{editError}</p>}
          </div>
        ) : (
          /* ── View mode ── */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    onClick={() => setLightboxIndex(i)}
                    className="w-20 h-20 object-cover rounded border border-[#D0C8B0] cursor-zoom-in flex-shrink-0"
                  />
                ))}
              </div>
            )}

            {node.type === 'person' && node.is_student && (
              <p className="text-xs text-[#3D7A5A] font-light tracking-wide">◎ student</p>
            )}

            {node.is_student && !canEdit && (
              <p className="text-xs text-[#A89880] font-light italic">
                Enter &ldquo;{node.title}&rdquo; as your name to edit this node.
              </p>
            )}

            {node.description && (
              <p className="text-sm font-light text-[#5A4A30] leading-relaxed whitespace-pre-wrap">{node.description}</p>
            )}

            {node.external_url && (
              <a
                href={/^https?:\/\//i.test(node.external_url) ? node.external_url : `https://${node.external_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#9A9080] underline underline-offset-2 hover:text-[#3A3020] break-all"
              >{node.external_url}</a>
            )}

            <div>
              <p className="text-xs text-[#9A9080] font-light uppercase tracking-wider mb-2">
                Connections ({connectedEntries.length})
              </p>
              {connectedEntries.length === 0 ? (
                <p className="text-xs text-[#A89880] font-light">None yet</p>
              ) : (
                <ul className="space-y-2">
                  {connectedEntries.map(({ conn, other }) => (
                    <li key={conn.id} className="flex items-start justify-between gap-2 group">
                      <span className="flex items-start gap-2 text-sm font-light text-[#5A4A30] min-w-0">
                        <span className="text-[#C0B8A0] mt-px flex-shrink-0">—</span>
                        <span className="truncate">{other.title}</span>
                      </span>
                      {userName && conn.created_by === userName && (
                        <button
                          onClick={() => handleUnlink(conn.id)}
                          title="Unlink"
                          className="flex-shrink-0 text-[#C0B8A0] hover:text-[#9A9080] text-sm leading-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
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
        <div className="p-5 border-t border-[#D0C8B0] space-y-2">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 text-sm font-light text-[#6B6050] border border-[#D0C8B0] rounded hover:bg-[#ECE7D5] transition-colors cursor-pointer"
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || saving}
                className="flex-1 py-2 text-sm font-light text-[#3A3020] border border-[#6B5A3A] rounded bg-[#6B5A3A] text-white hover:bg-[#5A4A2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >{saving ? 'Saving…' : 'Save'}</button>
            </div>
          ) : (
            <>
              <button
                onClick={onStartConnect}
                disabled={connectMode}
                className="w-full py-2 text-sm font-light text-[#3A3020] border border-[#D0C8B0] rounded hover:bg-[#ECE7D5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >{connectMode ? 'Click another object…' : 'Link to another object'}</button>

              {canEdit && (
                <button
                  onClick={startEdit}
                  className="w-full py-2 text-sm font-light text-[#3A3020] border border-[#D0C8B0] rounded hover:bg-[#ECE7D5] transition-colors cursor-pointer"
                >Edit this object</button>
              )}

              {canEdit && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 text-sm font-light text-[#A89880] hover:text-red-400 border border-[#D0C8B0] rounded hover:border-red-300 transition-colors cursor-pointer"
                >Delete this object</button>
              )}

              {canEdit && confirmDelete && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 text-sm font-light text-[#6B6050] border border-[#D0C8B0] rounded hover:bg-[#ECE7D5] transition-colors cursor-pointer"
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

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i) }}
              className="absolute left-4 text-white/70 hover:text-white text-3xl leading-none cursor-pointer select-none px-2"
            >‹</button>
          )}
          <img
            src={images[lightboxIndex].url}
            alt=""
            onClick={e => e.stopPropagation()}
            className="max-w-[85vw] max-h-[85vh] object-contain rounded shadow-2xl"
          />
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null && i < images.length - 1 ? i + 1 : i) }}
              className="absolute right-4 text-white/70 hover:text-white text-3xl leading-none cursor-pointer select-none px-2"
            >›</button>
          )}
          {images.length > 1 && (
            <p className="absolute bottom-4 text-white/50 text-xs">
              {lightboxIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  )
}
