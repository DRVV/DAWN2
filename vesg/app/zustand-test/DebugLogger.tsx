'use client'

import { useEffect } from "react"
import useStore from "./store"

export default function DebugLogger() {
  const { nodes, edges } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
  }))

  useEffect(() => {
    console.log("[zustand] Nodes changed:", nodes)
  }, [nodes])

  useEffect(() => {
    console.log("[zustand] Edges changed:", edges)
  }, [edges])

  return null
}
