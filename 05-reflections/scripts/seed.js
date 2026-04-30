import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

// Parse .env.local
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
)

const { nodes: seedNodes, connections: seedConnections } = JSON.parse(
  readFileSync(join(root, 'garden_seeds.json'), 'utf8')
)

// Insert nodes
console.log(`Inserting ${seedNodes.length} nodes…`)
const { data: inserted, error: nodeErr } = await supabase
  .from('nodes')
  .insert(
    seedNodes.map(n => ({
      type: n.type,
      title: n.title,
      description: n.description ?? null,
      arc_node: n.arc_node ?? null,
      x: null,
      y: null,
      external_url: n.external_url ?? null,
      created_by: n.created_by,
      is_seed: true,
    }))
  )
  .select('id, title')

if (nodeErr) {
  console.error('Node insert failed:', nodeErr.message)
  process.exit(1)
}

console.log(`  ✓ ${inserted.length} nodes inserted`)

// Build title → id map
const titleToId = Object.fromEntries(inserted.map(n => [n.title, n.id]))

// Resolve connections
const resolved = []
const skipped = []
for (const c of seedConnections) {
  const from = titleToId[c.from_title]
  const to   = titleToId[c.to_title]
  if (!from || !to) {
    skipped.push(`"${c.from_title}" → "${c.to_title}"`)
  } else {
    resolved.push({ from_node_id: from, to_node_id: to, created_by: 'Mattaniah' })
  }
}

if (skipped.length) {
  console.warn(`Skipped ${skipped.length} connections (title not found):`)
  skipped.forEach(s => console.warn('  -', s))
}

console.log(`Inserting ${resolved.length} connections…`)
const { error: connErr } = await supabase.from('connections').insert(resolved)

if (connErr) {
  console.error('Connection insert failed:', connErr.message)
  process.exit(1)
}

console.log(`  ✓ ${resolved.length} connections inserted`)
console.log('Seed complete.')
