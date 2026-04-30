import { useEffect, useRef, useState } from 'react'

interface Props {
  userName: string | null
  isAdmin: boolean
  onNameChange: (name: string) => void
  onClose: () => void
}

export default function SettingsPanel({ userName, isAdmin, onNameChange, onClose }: Props) {
  const [nameInput, setNameInput] = useState(userName ?? '')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    localStorage.setItem('garden_name', trimmed)
    onNameChange(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />

      <div className="fixed left-0 top-0 h-full w-72 z-30 bg-[#F5F1E8] border-r border-[#C9C3B5] shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#C9C3B5] flex items-center justify-between">
          <h2 className="text-sm font-light text-[#2A2520] tracking-wide">Settings</h2>
          <button
            onClick={onClose}
            className="text-[#A9A39D] hover:text-[#2A2520] text-xl leading-none cursor-pointer"
          >×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Name */}
          <div>
            <p className="text-xs text-[#8B8378] font-light uppercase tracking-wider mb-2">Your name</p>
            <input
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setSaved(false) }}
              onKeyDown={handleKey}
              maxLength={40}
              placeholder="Enter your name"
              className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378]"
            />
            <p className="text-xs text-[#A9A39D] font-light mt-1.5 leading-snug">
              Objects you've added are tied to this name. Changing it won't reassign them.
            </p>
            <button
              onClick={handleSave}
              disabled={!nameInput.trim() || nameInput.trim() === userName}
              className="mt-3 w-full py-2 text-sm font-light text-[#2A2520] border border-[#8B8378] rounded bg-[#EDE9E0] hover:bg-[#E0DAD0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saved ? '✓ Saved' : 'Save name'}
            </button>
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div className="rounded border border-[#8B8378] bg-[#EDE9E0] px-4 py-3 space-y-1">
              <p className="text-xs font-light text-[#2A2520] uppercase tracking-wider">Admin mode active</p>
              <p className="text-xs text-[#6B6560] font-light leading-snug">
                You can edit and delete any object in the garden, regardless of who created it.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#C9C3B5]">
          <p className="text-xs text-[#A9A39D] font-light leading-snug">
            Form / Flow / Feel · Spring 2026
          </p>
        </div>
      </div>
    </>
  )
}
