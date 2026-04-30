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

      <div className="fixed left-0 top-0 h-full w-72 z-30 bg-[#F5F0E4] border-r border-[#D0C8B0] shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#D0C8B0] flex items-center justify-between">
          <h2 className="text-sm font-light text-[#3A3020] tracking-wide">Settings</h2>
          <button
            onClick={onClose}
            className="text-[#A89880] hover:text-[#3A3020] text-xl leading-none cursor-pointer"
          >×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Name */}
          <div>
            <p className="text-xs text-[#9A9080] font-light uppercase tracking-wider mb-2">Your name</p>
            <input
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setSaved(false) }}
              onKeyDown={handleKey}
              maxLength={40}
              placeholder="Enter your name"
              className="w-full border border-[#D0C8B0] bg-[#F5F0E4]/60 rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A]"
            />
            <p className="text-xs text-[#A89880] font-light mt-1.5 leading-snug">
              Objects you've added are tied to this name. Changing it won't reassign them.
            </p>
            <button
              onClick={handleSave}
              disabled={!nameInput.trim() || nameInput.trim() === userName}
              className="mt-3 w-full py-2 text-sm font-light text-white bg-[#6B5A3A] border border-[#6B5A3A] rounded hover:bg-[#5A4A2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saved ? '✓ Saved' : 'Save name'}
            </button>
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div className="rounded border border-[#D0C8B0] bg-[#EDE5D0] px-4 py-3 space-y-1">
              <p className="text-xs font-light text-[#3A3020] uppercase tracking-wider">Admin mode active</p>
              <p className="text-xs text-[#6B6050] font-light leading-snug">
                You can edit and delete any object in the garden, regardless of who created it.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#D0C8B0]">
          <p className="text-xs text-[#A89880] font-light leading-snug">
            Form / Flow / Feel · Spring 2026
          </p>
        </div>
      </div>
    </>
  )
}
