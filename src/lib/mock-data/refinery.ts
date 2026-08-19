export interface RefineryData {
  padd: string
  name: string
  utilization: number
  capacity: number
  runs: number
  crackSpread: number
  trend: 'up' | 'down' | 'stable'
}

export const refineryData: RefineryData[] = [
  { padd: 'PADD 1', name: 'East Coast', utilization: 78.2, capacity: 950, runs: 743, crackSpread: 28.5, trend: 'down' },
  { padd: 'PADD 2', name: 'Midwest', utilization: 92.1, capacity: 3800, runs: 3500, crackSpread: 32.1, trend: 'up' },
  { padd: 'PADD 3', name: 'Gulf Coast', utilization: 94.5, capacity: 9800, runs: 9261, crackSpread: 35.8, trend: 'stable' },
  { padd: 'PADD 4', name: 'Rocky Mountain', utilization: 85.3, capacity: 620, runs: 529, crackSpread: 29.4, trend: 'stable' },
  { padd: 'PADD 5', name: 'West Coast', utilization: 88.7, capacity: 3200, runs: 2838, crackSpread: 31.2, trend: 'down' },
]

export const refineryHistory = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return {
    date: d.toISOString().split('T')[0],
    overall: +(88 + Math.sin(i * 0.3) * 4 + (Math.random() - 0.5) * 2).toFixed(1),
    gulfCoast: +(92 + Math.sin(i * 0.25) * 3 + (Math.random() - 0.5) * 1.5).toFixed(1),
    midwest: +(90 + Math.cos(i * 0.2) * 3 + (Math.random() - 0.5) * 2).toFixed(1),
  }
})
