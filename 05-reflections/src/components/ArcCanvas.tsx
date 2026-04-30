import { useRef, useState, useCallback, useEffect, type MouseEvent, type ReactNode } from 'react'

export const PENTAGON_CENTER = { x: 900, y: 600 }

// ─── Tune this one number to resize the whole pentagon ───────────────────────
const PENTAGON_RADIUS = 500
// ─────────────────────────────────────────────────────────────────────────────

function buildPentagon(r: number) {
  const { x: cx, y: cy } = PENTAGON_CENTER
  // Vertices of a regular pentagon, apex pointing up (-90°), 72° apart
  const pts = [-90, -18, 54, 126, 198].map(deg => ({
    x: Math.round(cx + r * Math.cos((deg * Math.PI) / 180)),
    y: Math.round(cy + r * Math.sin((deg * Math.PI) / 180)),
  }))

  // Bezier control point: push each edge midpoint outward from center
  const push = r * 0.38
  const ctrl = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    const mag = Math.hypot(mx - cx, my - cy)
    return { x: Math.round(mx + ((mx - cx) / mag) * push), y: Math.round(my + ((my - cy) / mag) * push) }
  }

  const arcPath = pts
    .map((p, i) => {
      const q = pts[(i + 1) % 5]
      const c = ctrl(p, q)
      return (i === 0 ? `M ${p.x},${p.y} ` : '') + `Q ${c.x},${c.y} ${q.x},${q.y}`
    })
    .join(' ')

  return {
    arcNodes: [
      { id: 'systems'     as const, label: 'Systems + Sensibilities',       ...pts[0] },
      { id: 'repetition'  as const, label: 'Forms of Repetition',           ...pts[1] },
      { id: 'personal'    as const, label: 'Mapping the Personal',          ...pts[2] },
      { id: 'world'       as const, label: 'World as Input',                ...pts[3] },
      { id: 'reflections' as const, label: 'Reflections + Future Thinking', ...pts[4] },
    ],
    arcPath,
  }
}

const { arcNodes: ARC_NODES, arcPath: ARC_PATH } = buildPentagon(PENTAGON_RADIUS)
export { ARC_NODES }
export type ArcNodeId = (typeof ARC_NODES)[number]['id']
export const ZONE_RADIUS = 235
export const STUDENT_RING_R = 900

const SCALE_MIN = 0.3
const SCALE_MAX = 4
const CANVAS_W = 1800
const CANVAS_H = 1200

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

  function clientToViewBox(clientX: number, clientY: number) {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    return pt.matrixTransform(svg.getScreenCTM()!.inverse())
  }

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const handler = (e: globalThis.WheelEvent) => {
      e.preventDefault()
      const pt = el.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const { x: mx, y: my } = pt.matrixTransform(el.getScreenCTM()!.inverse())
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
    const ctm = svgRef.current!.getScreenCTM()!
    const dx = (e.clientX - startX) / ctm.a
    const dy = (e.clientY - startY) / ctm.d
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
    setTransform(prev => ({ ...prev, x: ox + dx, y: oy + dy }))
  }, [])

  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const { x: vx, y: vy } = clientToViewBox(clientX, clientY)
    return {
      x: (vx - transform.x) / transform.scale,
      y: (vy - transform.y) / transform.scale,
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

          {/* Student ring — outer circle where student nodes are placed */}
          <circle
            cx={PENTAGON_CENTER.x}
            cy={PENTAGON_CENTER.y}
            r={STUDENT_RING_R}
            fill="none"
            stroke="#A8B89A"
            strokeWidth={1}
            strokeDasharray="3 8"
            opacity={0.35}
          />

          {/* Zone circles */}
          {ARC_NODES.map(node => (
            <circle
              key={`zone-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={ZONE_RADIUS}
              fill="none"
              stroke="#8B8378"
              strokeWidth={1}
              strokeDasharray="4 6"
              opacity={0.45}
            />
          ))}

          {/* Pentagon arc */}
          <path
            d={ARC_PATH}
            fill="none"
            stroke="#8B8378"
            strokeWidth={1.2}
            strokeLinejoin="round"
            opacity={0.25}
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
