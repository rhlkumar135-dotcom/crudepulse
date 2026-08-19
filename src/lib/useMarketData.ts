import { useState, useEffect, useCallback, useRef } from 'react'

export interface MarketState<T> {
  data: T | null
  loading: boolean
  error: string | null
  source: 'api' | 'mock' | null
  lastUpdated: string | null
}

export function useMarketData<T>(endpoint: string, tier: string = 'free', refreshInterval: number = 300000) {
  const [state, setState] = useState<MarketState<T>>({ data: null, loading: true, error: null, source: null, lastUpdated: null })
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    try {
      const url = endpoint.includes('?') ? `${endpoint}&tier=${tier}` : `${endpoint}?tier=${tier}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      if (mountedRef.current) {
        setState({ data: body as T, loading: false, error: null, source: body.source || 'api', lastUpdated: body.lastUpdated || null })
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to load' }))
      }
    }
  }, [endpoint, tier])

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => { mountedRef.current = false; clearInterval(interval) }
  }, [fetchData, refreshInterval])

  return { ...state, refetch: fetchData }
}
