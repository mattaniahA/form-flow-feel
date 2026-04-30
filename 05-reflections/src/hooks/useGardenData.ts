import { useEffect, useState } from 'react'
import { supabase, type GardenNode, type Connection } from '../lib/supabase'

export function useGardenData() {
  const [nodes, setNodes] = useState<GardenNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    // Initial fetch
    supabase.from('nodes').select('*').order('created_at').then(({ data }) => {
      if (data) setNodes(data)
    })
    supabase.from('connections').select('*').order('created_at').then(({ data }) => {
      if (data) setConnections(data)
    })

    const nodeChannel = supabase
      .channel('nodes-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nodes' },
        (payload) => setNodes(prev => [...prev, payload.new as GardenNode])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nodes' },
        (payload) => setNodes(prev => prev.map(n => n.id === payload.new.id ? payload.new as GardenNode : n))
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'nodes' },
        (payload) => setNodes(prev => prev.filter(n => n.id !== payload.old.id))
      )
      .subscribe()

    const connChannel = supabase
      .channel('connections-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections' },
        (payload) => setConnections(prev => [...prev, payload.new as Connection])
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'connections' },
        (payload) => setConnections(prev => prev.filter(c => c.id !== payload.old.id))
      )
      .subscribe()

    return () => {
      supabase.removeChannel(nodeChannel)
      supabase.removeChannel(connChannel)
    }
  }, [])

  return { nodes, connections }
}
