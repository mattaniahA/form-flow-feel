import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const students = [
  // Section 1
  'Aiden Drake',
  'ANT',
  'Chelsea Miya',
  'Christine Liao',
  'Gia Galvez',
  'Hana Kim',
  'Heather Corcoran',
  'Hope Yoon',
  'Jason Lei',
  'Javiera Tapia',
  'Jenna Rothstein',
  'Julia Riguerra',
  'Kristin Bauer',
  'Liam Houlihan',
  'Lina Lopes',
  'Luz Calero Forero',
  'Maria Belen Benavides Alvarado',
  'Maya Camille',
  'Nico Raphaël.le Grevatt',
  'Nicolle Bustos',
  'Noe Loyola',
  'Sawyer Newman',
  'Skylar Wang',
  'st aoue',
  'Zeh Fernandes',
  // Section 2
  'Alara Kalfazade',
  'Ceara Hennessey',
  'Ekaterina Chuprun',
  'Florida Elago',
  'Gil Monteverde',
  'Heather Heredia',
  'Isa Milano',
  'Josefa Rackl',
  'Jules Park',
  'Khadidja Elkeurti',
  'Kuleni Shewakena',
  'Maaike van Cruchten',
  'Max Hamilton',
  'megan walker',
  'Nica Ross',
  'Nikodimos Sendek',
  'Pey Emery',
  'Romello Goodman',
  'Sarah Alvarez',
  'Shalin Shah',
  'Stefan Nicolaou',
  'Thomas Pausz',
  'Tiffany Li',
  'xi da',
  'Xing Zhang',
]

console.log(`Inserting ${students.length} students…`)

const { data, error } = await supabase.from('nodes').insert(
  students.map(name => ({
    type: 'person',
    title: name,
    description: null,
    arc_node: null,
    x: null,
    y: null,
    external_url: null,
    created_by: name,
    is_seed: true,
    is_student: true,
  }))
).select('id, title')

if (error) {
  console.error('Insert failed:', error.message)
  process.exit(1)
}

console.log(`  ✓ ${data.length} students inserted`)
