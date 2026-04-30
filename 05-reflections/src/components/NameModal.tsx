import { useState } from 'react'

interface Props {
  onSubmit: (name: string) => void
}

export default function NameModal({ onSubmit }: Props) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('garden_name', trimmed)
    onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-[#F5F1E8] border border-[#C9C3B5] rounded-lg p-8 w-80 shadow-lg">
        <h2 className="text-lg font-light text-[#2A2520] mb-1">Welcome to the Garden</h2>
        <p className="text-sm text-[#6B6560] font-light mb-1">What's your name?</p>
        <p className="text-xs text-[#A9A39D] font-light mb-6">Use your full name to edit your student node.</p>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-[#C9C3B5] bg-white/60 rounded px-3 py-2 text-sm text-[#2A2520] placeholder-[#A9A39D] outline-none focus:border-[#8B8378] mb-4"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2 text-sm font-light text-[#2A2520] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
