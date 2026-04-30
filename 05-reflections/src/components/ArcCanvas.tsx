import { useRef, useState, useCallback, useEffect, type MouseEvent, type ReactNode } from 'react'

const PENTAGON_CENTER = { x: 800, y: 460 }

export const ARC_NODES = [
  { id: 'systems',     label: 'Systems + Sensibilities',      x: 800,  y: 110 },
  { id: 'repetition',  label: 'Forms of Repetition',          x: 1133, y: 352 },
  { id: 'personal',    label: 'Mapping the Personal',         x: 1006, y: 743 },
  { id: 'world',       label: 'World as Input',               x: 594,  y: 743 },
  { id: 'reflections', label: 'Reflections + Future Thinking', x: 467,  y: 352 },
] as const

export type ArcNodeId = typeof ARC_NODES[number]['id']
export const ZONE_RADIUS = 200

const ARC_PATH = 'M 800,110 L 1133,352 L 1006,743 L 594,743 L 467,352'

const SCALE_MIN = 0.3
const SCALE_MAX = 4
const CANVAS_W = 1600
const CANVAS_H = 900

// Compute a circular arc centered on `node`, running along the outside of its
// zone circle. The arc spans ±62° around the outward direction from the
// pentagon center, chosen so text always reads left-to-right:
//
//  Upper nodes (outward angle in upper screen half, sin θ < 0):
//    CW arc (sweep=1), from θ−span to θ+span.
//    Tangent at midpoint: (−sin θ, cos θ) — positive x (rightward). ✓
//
//  Lower nodes (outward angle in lower screen half, sin θ ≥ 0):
//    CCW arc (sweep=0), START and END swapped → from θ+span to θ−span.
//    Tangent at midpoint: (sin θ, −cos θ) — positive x (rightward). ✓
//
// Both cases produce a 124° minor arc (large-arc-flag = 0).
function labelArcPath(node: { x: number; y: number }): string {
  const R = ZONE_RADIUS + 18
  const span = (62 * Math.PI) / 180
  const θ = Math.atan2(node.y - PENTAGON_CENTER.y, node.x - PENTAGON_CENTER.x)
  const isUpper = Math.sin(θ) < 0

  const a1 = isUpper ? θ - span : θ + span  // start angle
  const a2 = isUpper ? θ + span : θ - span  // end angle
  const sweep = isUpper ? 1 : 0

  const sx = node.x + R * Math.cos(a1)
  const sy = node.y + R * Math.sin(a1)
  const ex = node.x + R * Math.cos(a2)
  const ey = node.y + R * Math.sin(a2)
  return `M ${sx.toFixed(1)},${sy.toFixed(1)} A ${R},${R} 0 0 ${sweep} ${ex.toFixed(1)},${ey.toFixed(1)}`
}

interface Props {
  children?: ReactNode
  onCanvasClick?: (x: number, y: number) => void       // single-click (connect mode cancel)
  onCanvasDoubleClick?: (x: number, y: number) => void // double-click (add object)
  connectMode?: boolean
}

export default function ArcCanvas({ children, onCanvasClick, onCanvasDoubleClick, connectMode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const moved = useRef(false)

  const clampScale = (s: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, s))

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const handler = (e: globalThis.WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width  * CANVAS_W
      const my = (e.clientY - rect.top)  / rect.height * CANVAS_H
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      setTransform(prev => {
        const next = clampScale(prev.scale * factor)
        const ratio = next / prev.scale
        return { scale: next, x: mx - ratio * (mx - prev.x), y: my - ratio * (my - prev.y) }
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const onMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    drag.current = { startX: e.clientX, startY: e.clientY, ox: transform.x, oy: transform.y }
    moved.current = false
  }, [transform])

  const onMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (!drag.current) return
    const { startX, startY, ox, oy } = drag.current
    const rect = svgRef.current!.getBoundingClientRect()
    const scaleRatio = CANVAS_W / rect.width
    const dx = (e.clientX - startX) * scaleRatio
    const dy = (e.clientY - startY) * scaleRatio
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
    setTransform(prev => ({ ...prev, x: ox + dx, y: oy + dy }))
  }, [])

  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const scaleRatio = CANVAS_W / rect.width
    const cx = (clientX - rect.left) * scaleRatio
    const cy = (clientY - rect.top)  * scaleRatio
    return {
      x: (cx - transform.x) / transform.scale,
      y: (cy - transform.y) / transform.scale,
    }
  }, [transform])

  const onMouseUp = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (!drag.current) return
    if (!moved.current && onCanvasClick) {
      const { x, y } = toCanvasCoords(e.clientX, e.clientY)
      onCanvasClick(x, y)
    }
    drag.current = null
  }, [onCanvasClick, toCanvasCoords])

  const onMouseLeave = useCallback(() => { drag.current = null }, [])

  const onDoubleClick = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (!onCanvasDoubleClick) return
    const { x, y } = toCanvasCoords(e.clientX, e.clientY)
    onCanvasDoubleClick(x, y)
  }, [onCanvasDoubleClick, toCanvasCoords])

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 })

  const { x, y, scale } = transform

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F5F1E8]">
      <button
        onClick={resetView}
        className="absolute bottom-5 right-5 z-10 px-3 py-1.5 text-xs font-light text-[#6B6560] border border-[#C9C3B5] rounded hover:bg-[#EDE9E0] transition-colors cursor-pointer"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        reset view
      </button>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ cursor: connectMode ? 'crosshair' : drag.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
      >
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          {/* Hidden arc paths used as textPath guides — must be inside the transform group */}
          <defs>
            {ARC_NODES.map(node => (
              <path key={node.id} id={`label-arc-${node.id}`} d={labelArcPath(node)} />
            ))}
          </defs>

          {/* Zone circles */}
          {ARC_NODES.map(node => (
            <circle
              key={`zone-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={ZONE_RADIUS}
              fill="none"
              stroke="#C9C3B5"
              strokeWidth={1}
              strokeDasharray="4 6"
              opacity={0.5}
            />
          ))}

          {/* Pentagon arc */}
          <path
            d={ARC_PATH}
            fill="none"
            stroke="#8B8378"
            strokeWidth={1.2}
            strokeLinejoin="round"
            opacity={0.55}
          />

          {/* Node dots + curved labels */}
          {ARC_NODES.map(node => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={5} fill="#8B8378" opacity={0.7} />
              <text
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={300}
                fontSize={12}
                fill="#4A4540"
                letterSpacing={0.5}
                style={{ userSelect: 'none' }}
              >
                <textPath
                  href={`#label-arc-${node.id}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  {node.label}
                </textPath>
              </text>
            </g>
          ))}

          {children}
        </g>
      </svg>
    </div>
  )
}
