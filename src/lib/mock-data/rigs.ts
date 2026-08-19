export interface RigData {
  basin: string
  oilRigs: number
  gasRigs: number
  totalChange: number
  region: string
}

export interface RigWeek {
  week: string
  total: number
  oil: number
  gas: number
  wtiPrice: number
}

export const currentRigs: RigData[] = [
  { basin: 'Permian', oilRigs: 295, gasRigs: 12, totalChange: -3, region: 'US' },
  { basin: 'Eagle Ford', oilRigs: 48, gasRigs: 8, totalChange: -1, region: 'US' },
  { basin: 'Bakken', oilRigs: 35, gasRigs: 2, totalChange: 0, region: 'US' },
  { basin: 'DJ Basin', oilRigs: 18, gasRigs: 14, totalChange: +1, region: 'US' },
  { basin: 'Marcellus', oilRigs: 3, gasRigs: 28, totalChange: -2, region: 'US' },
  { basin: 'Gulf of Mexico', oilRigs: 15, gasRigs: 1, totalChange: 0, region: 'US' },
  { basin: 'SCOOP/STACK', oilRigs: 12, gasRigs: 4, totalChange: +1, region: 'US' },
  { basin: 'Haynesville', oilRigs: 0, gasRigs: 32, totalChange: -1, region: 'US' },
  { basin: 'Other US', oilRigs: 8, gasRigs: 2, totalChange: 0, region: 'US' },
]

export const rigHistory: RigWeek[] = Array.from({ length: 52 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (51 - i) * 7)
  const base = 450 + Math.sin(i * 0.15) * 30 + (Math.random() - 0.5) * 15
  const oil = Math.floor(base * 0.78)
  const gas = Math.floor(base * 0.22)
  return {
    week: d.toISOString().split('T')[0],
    total: oil + gas,
    oil,
    gas,
    wtiPrice: 68 + Math.sin(i * 0.12) * 8 + (Math.random() - 0.5) * 3,
  }
})

export const totalRigs = currentRigs.reduce((s, r) => s + r.oilRigs + r.gasRigs, 0)
export const totalOilRigs = currentRigs.reduce((s, r) => s + r.oilRigs, 0)
export const totalGasRigs = currentRigs.reduce((s, r) => s + r.gasRigs, 0)
export const totalChange = currentRigs.reduce((s, r) => s + r.totalChange, 0)
