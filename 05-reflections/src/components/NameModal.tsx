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
      <div className="bg-[#F5F0E4] border border-[#D0C8B0] rounded-lg p-8 w-96 shadow-lg">
        <h2 className="text-lg font-medium text-[#6B5A3A] mb-3">welcome to the class garden ❤︎ </h2>

        <p className="text-sm text-[#6B6050] font-light leading-relaxed mb-4">
          A shared map of ideas across class. Double-click to plant, click to connect.
        </p>

        <p className="text-sm text-[#6B6050] font-light mb-1">What's your name?</p>
        <p className="text-xs text-[#9A9080] font-light mb-4">Use your full name to edit your student node.</p>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-[#D0C8B0] bg-[#F5F0E4] rounded px-3 py-2 text-sm text-[#3A3020] placeholder-[#A89880] outline-none focus:border-[#6B5A3A] mb-4"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2 text-sm font-light text-white bg-[#6B5A3A] border border-[#6B5A3A] rounded hover:bg-[#5A4A2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Enter the Garden
          </button>
        </form>
      </div>
    </div>
  )
}
