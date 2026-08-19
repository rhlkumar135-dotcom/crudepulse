export interface StoragePoint {
  date: string
  cushing: number
  spRoc: number
  totalUs: number
}

export const storageHistory: StoragePoint[] = Array.from({ length: 52 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (51 - i) * 7)
  const seasonal = Math.sin((i / 52) * Math.PI * 2) * 15
  return {
    date: d.toISOString().split('T')[0],
    cushing: +(25 + seasonal + (Math.random() - 0.5) * 4).toFixed(1),
    spRoc: +(140 + seasonal * 2 + (Math.random() - 0.5) * 8).toFixed(1),
    totalUs: +(420 + seasonal * 5 + (Math.random() - 0.5) * 15).toFixed(1),
  }
})

export const latestStorage = storageHistory[storageHistory.length - 1]
