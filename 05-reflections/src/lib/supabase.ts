import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type NodeType = 'project' | 'person' | 'topic'
export type ArcNode = 'systems' | 'repetition' | 'personal' | 'world' | 'reflections'

export interface GardenNode {
  id: string
  type: NodeType
  title: string
  description: string | null
  arc_node: ArcNode | null
  x: number | null
  y: number | null
  external_url: string | null
  created_by: string
  is_seed: boolean
  is_student: boolean
  created_at: string
}

export interface NodeImage {
  id: string
  node_id: string
  url: string
  created_at: string
}

export interface Connection {
  id: string
  from_node_id: string
  to_node_id: string
  created_by: string
  created_at: string
}
