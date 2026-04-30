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
        className="bg-[#F5F0E4] border border-[#D0C8B0] rounded-lg p-6 w-[480px] shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-base font-light text-[#3A3020] mb-5">Add to the garden</h2>

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
                    ? 'border-[#6B5A3A] bg-[#EDE5D0] text-[#6B5A3A]'
                    : 'border-[#D0C8B0] text-[#6B6050] hover:bg-[#ECE7D5]'}`}
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
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 80))}
              placeholder="Title (required)"
              className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A]"
            />
            <p className="text-right text-xs text-[#A89880] mt-1">{title.length}/80</p>
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 400))}
            placeholder="Description (optional)"
            rows={3}
            className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A] resize-none"
          />

          {/* URL */}
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL (optional)"
            className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A]"
          />

          {/* Arc node — hidden for students, who always land on the outer ring */}
          {!(type === 'person' && isStudent) && (
            <div>
              <p className="text-xs text-[#9A9080] font-light mb-1.5">
                Week <span className="text-[#A89880]">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ARC_NODES.map(an => (
                  <button
                    key={an.id}
                    type="button"
                    onClick={() => setArcNode(arcNode === an.id ? null : an.id as ArcNode)}
                    className={`px-2.5 py-1 text-xs font-light rounded border transition-colors cursor-pointer
                      ${arcNode === an.id
                        ? 'border-[#6B5A3A] bg-[#EDE5D0] text-[#6B5A3A]'
                        : 'border-[#D0C8B0] text-[#6B6050] hover:bg-[#ECE7D5]'}`}
                  >
                    {an.label}
                  </button>
                ))}
              </div>
              {!arcNode && (
                <p className="text-xs text-[#A89880] mt-1.5">
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
              className="flex-1 py-2 text-sm font-light text-[#6B6050] border border-[#D0C8B0] rounded hover:bg-[#ECE7D5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="flex-1 py-2 text-sm font-light text-white bg-[#6B5A3A] border border-[#6B5A3A] rounded hover:bg-[#5A4A2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
