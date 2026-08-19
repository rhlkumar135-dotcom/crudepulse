export interface Chokepoint {
  id: string
  name: string
  shortName: string
  lat: number
  lng: number
  dailyVolume: number
  riskScore: number
  trend: 'up' | 'down' | 'stable'
  vesselsToday: number
  avgWaitHours: number
  keyRoute: string
}

export const chokepoints: Chokepoint[] = [
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    shortName: 'Hormuz',
    lat: 26.56,
    lng: 56.25,
    dailyVolume: 21000000,
    riskScore: 0.78,
    trend: 'up',
    vesselsToday: 84,
    avgWaitHours: 12.5,
    keyRoute: 'Persian Gulf → Indian Ocean',
  },
  {
    id: 'malacca',
    name: 'Strait of Malacca',
    shortName: 'Malacca',
    lat: 2.5,
    lng: 101.5,
    dailyVolume: 16000000,
    riskScore: 0.32,
    trend: 'stable',
    vesselsToday: 156,
    avgWaitHours: 6.2,
    keyRoute: 'Indian Ocean → South China Sea',
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    shortName: 'Suez',
    lat: 30.58,
    lng: 32.34,
    dailyVolume: 5500000,
    riskScore: 0.65,
    trend: 'up',
    vesselsToday: 42,
    avgWaitHours: 18.7,
    keyRoute: 'Red Sea → Mediterranean',
  },
  {
    id: 'bab-el-mandeb',
    name: 'Bab-el-Mandeb',
    shortName: 'Bab-Mandeb',
    lat: 12.58,
    lng: 43.33,
    dailyVolume: 6200000,
    riskScore: 0.82,
    trend: 'up',
    vesselsToday: 38,
    avgWaitHours: 22.1,
    keyRoute: 'Gulf of Aden → Red Sea',
  },
  {
    id: 'danish',
    name: 'Danish Straits',
    shortName: 'Danish',
    lat: 56.0,
    lng: 11.0,
    dailyVolume: 3200000,
    riskScore: 0.45,
    trend: 'stable',
    vesselsToday: 28,
    avgWaitHours: 4.8,
    keyRoute: 'North Sea → Baltic Sea',
  },
  {
    id: 'bosporus',
    name: 'Bosporus Strait',
    shortName: 'Bosporus',
    lat: 41.12,
    lng: 29.05,
    dailyVolume: 2400000,
    riskScore: 0.52,
    trend: 'down',
    vesselsToday: 32,
    avgWaitHours: 8.3,
    keyRoute: 'Black Sea → Mediterranean',
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    shortName: 'Panama',
    lat: 9.15,
    lng: -79.68,
    dailyVolume: 1000000,
    riskScore: 0.28,
    trend: 'stable',
    vesselsToday: 14,
    avgWaitHours: 32.5,
    keyRoute: 'Atlantic → Pacific',
  },
  {
    id: 'cape',
    name: 'Cape of Good Hope',
    shortName: 'Cape',
    lat: -34.35,
    lng: 18.47,
    dailyVolume: 5800000,
    riskScore: 0.15,
    trend: 'stable',
    vesselsToday: 62,
    avgWaitHours: 0,
    keyRoute: 'Atlantic → Indian Ocean (alternative)',
  },
]
