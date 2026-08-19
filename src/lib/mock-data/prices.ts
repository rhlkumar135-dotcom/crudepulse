export interface PricePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

function generatePriceHistory(basePrice: number, days: number, volatility: number): PricePoint[] {
  const data: PricePoint[] = []
  let price = basePrice
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const change = (Math.random() - 0.48) * volatility
    price = Math.max(price * 0.7, Math.min(price * 1.3, price + change))
    const open = price + (Math.random() - 0.5) * volatility * 0.5
    const close = price
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    data.push({
      date: d.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(Math.random() * 500000 + 200000),
    })
  }
  return data
}

export const wtiHistory = generatePriceHistory(72.5, 365, 1.8)
export const brentHistory = generatePriceHistory(76.8, 365, 1.9)

export const currentWTI = wtiHistory[wtiHistory.length - 1].close
export const currentBrent = brentHistory[brentHistory.length - 1].close
export const spread = +(currentBrent - currentWTI).toFixed(2)
export const wtiChange = +(currentWTI - wtiHistory[wtiHistory.length - 2].close).toFixed(2)
export const brentChange = +(currentBrent - brentHistory[brentHistory.length - 2].close).toFixed(2)

export const wtiChangePercent = +((wtiChange / wtiHistory[wtiHistory.length - 2].close) * 100).toFixed(2)
export const brentChangePercent = +((brentChange / brentHistory[brentHistory.length - 2].close) * 100).toFixed(2)
