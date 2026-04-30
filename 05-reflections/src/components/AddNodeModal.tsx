import { useState } from 'react'
import { supabase, type NodeType, type ArcNode } from '../lib/supabase'
import { ARC_NODES } from './ArcCanvas'

interface Props {
  initialArcNode: ArcNode | null
  clickX: number
  clickY: number
  createdBy: string
  onClose: () => void
}

const TYPE_LABELS: Record<NodeType, string> = {
  project: '❀ project',
  person:  '● person',
  topic:   '◗ idea',
}

export default function AddNodeModal({ initialArcNode, clickX, clickY, createdBy, onClose }: Props) {
  const [type, setType] = useState<NodeType>('project')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [arcNode, setArcNode] = useState<ArcNode | null>(initialArcNode)
  const [isStudent, setIsStudent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError(null)

    const student = type === 'person' && isStudent
    const { error: err } = await supabase.from('nodes').insert({
      type,
      title: title.trim(),
      description: description.trim() || null,
      arc_node: student ? null : arcNode,
      x: (!student && arcNode) ? clickX : null,
      y: (!student && arcNode) ? clickY : null,
      external_url: url.trim() || null,
      created_by: createdBy,
      is_seed: false,
      is_student: student,
    })

    if (err) {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-[#F5F1E8] border border-[#C9C3B5] rounded-lg p-6 w-[480px] shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-base font-light text-[#2A2520] mb-5">Add to the garden</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="flex gap-2">
            {(Object.keys(TYPE_LABELS) as NodeType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-light rounded border transition-colors cursor-pointer
                  ${type === t
                    ? 'border-[#8B8378] bg-[#EDE9E0] text-[#2A2520]'
                    : 'border-[#C9C3B5] text-[#6B6560] hover:bg-[#EDE9E0]'}`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Student toggle — only for person */}
          {type === 'person' && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isStudent}
                onChange={e => setIsStudent(e.target.checked)}
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
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 80))}
              placeholder="Title (required)"
              className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378]"
            />
            <p className="text-right text-xs text-[#A9A39D] mt-1">{title.length}/80</p>
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 400))}
            placeholder="Description (optional)"
            rows={3}
            className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378] resize-none"
          />

          {/* URL */}
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL (optional)"
            className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378]"
          />

          {/* Arc node — hidden for students, who always land on the outer ring */}
          {!(type === 'person' && isStudent) && (
            <div>
              <p className="text-xs text-[#8B8378] font-light mb-1.5">
                Week <span className="text-[#A9A39D]">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ARC_NODES.map(an => (
                  <button
                    key={an.id}
                    type="button"
                    onClick={() => setArcNode(arcNode === an.id ? null : an.id as ArcNode)}
                    className={`px-2.5 py-1 text-xs font-light rounded border transition-colors cursor-pointer
                      ${arcNode === an.id
                        ? 'border-[#8B8378] bg-[#EDE9E0] text-[#2A2520]'
                        : 'border-[#C9C3B5] text-[#6B6560] hover:bg-[#EDE9E0]'}`}
                  >
                    {an.label}
                  </button>
                ))}
              </div>
              {!arcNode && (
                <p className="text-xs text-[#A9A39D] mt-1.5">
                  No week selected — will appear in the center of the canvas.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="flex-1 py-2 text-sm font-light text-[#2A2520] border border-[#8B8378] rounded bg-[#EDE9E0] hover:bg-[#E0DAD0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
