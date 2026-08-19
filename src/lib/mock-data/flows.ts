export interface TradeFlow {
  id: string
  from: string
  fromLat: number
  fromLng: number
  to: string
  toLat: number
  toLng: number
  volume: number
  route: string
}

export const tradeFlows: TradeFlow[] = [
  { id: 'f1', from: 'Saudi Arabia', fromLat: 24.7, fromLng: 46.7, to: 'China', toLat: 31.2, toLng: 121.5, volume: 1750000, route: 'Hormuz → Malacca' },
  { id: 'f2', from: 'Russia', fromLat: 55.7, fromLng: 37.6, to: 'China', toLat: 39.9, toLng: 116.4, volume: 1300000, route: 'Pipeline + ESPO' },
  { id: 'f3', from: 'Saudi Arabia', fromLat: 24.7, fromLng: 46.7, to: 'India', toLat: 19.1, toLng: 72.9, volume: 980000, route: 'Hormuz → Arabian Sea' },
  { id: 'f4', from: 'Iraq', fromLat: 33.3, fromLng: 44.4, to: 'China', toLat: 31.2, toLng: 121.5, volume: 920000, route: 'Basra → Hormuz → Malacca' },
  { id: 'f5', from: 'United States', fromLat: 29.8, fromLng: -95.4, to: 'Europe', toLat: 51.5, toLng: -0.1, volume: 850000, route: 'Gulf Coast → Atlantic' },
  { id: 'f6', from: 'UAE', fromLat: 24.5, fromLng: 54.7, to: 'Japan', toLat: 35.7, toLng: 139.7, volume: 720000, route: 'Hormuz → Malacca → Pacific' },
  { id: 'f7', from: 'Kuwait', fromLat: 29.4, fromLng: 47.9, to: 'China', toLat: 22.3, toLng: 114.2, volume: 680000, route: 'Hormuz → Malacca' },
  { id: 'f8', from: 'Brazil', fromLat: -22.9, fromLng: -43.2, to: 'China', toLat: 31.2, toLng: 121.5, volume: 620000, route: 'Atlantic → Cape → Malacca' },
  { id: 'f9', from: 'Nigeria', fromLat: 6.5, fromLng: 3.4, to: 'India', toLat: 19.1, toLng: 72.9, volume: 580000, route: 'West Africa → Cape → Indian Ocean' },
  { id: 'f10', from: 'Russia', fromLat: 59.9, fromLng: 30.3, to: 'India', toLat: 19.1, toLng: 72.9, volume: 550000, route: 'Baltic → Suez → Indian Ocean' },
  { id: 'f11', from: 'Angola', fromLat: -8.8, fromLng: 13.2, to: 'China', toLat: 31.2, toLng: 121.5, volume: 500000, route: 'West Africa → Cape → Malacca' },
  { id: 'f12', from: 'Iraq', fromLat: 33.3, fromLng: 44.4, to: 'United States', toLat: 29.8, toLng: -95.4, volume: 450000, route: 'Basra → Suez → Atlantic' },
  { id: 'f13', from: 'Canada', fromLat: 53.5, fromLng: -113.5, to: 'United States', toLat: 29.8, toLng: -95.4, volume: 4200000, route: 'Pipeline (Keystone/Enbridge)' },
  { id: 'f14', from: 'Mexico', fromLat: 19.4, fromLng: -99.1, to: 'United States', toLat: 29.8, toLng: -95.4, volume: 600000, route: 'Gulf of Mexico' },
  { id: 'f15', from: 'Saudi Arabia', fromLat: 24.7, fromLng: 46.7, to: 'South Korea', toLat: 37.6, toLng: 127.0, volume: 520000, route: 'Hormuz → Malacca → Pacific' },
]

export const regionProducers = [
  { name: 'Middle East', lat: 28, lng: 45, production: 31500000, color: '#F5A623' },
  { name: 'North America', lat: 40, lng: -100, production: 17200000, color: '#2DD4BF' },
  { name: 'Russia & CIS', lat: 55, lng: 40, production: 11200000, color: '#EF4444' },
  { name: 'West Africa', lat: 6, lng: 3, production: 5800000, color: '#A78BFA' },
  { name: 'South America', lat: -10, lng: -55, production: 7500000, color: '#F472B6' },
  { name: 'Asia Pacific', lat: 10, lng: 110, production: 3400000, color: '#38BDF8' },
]
