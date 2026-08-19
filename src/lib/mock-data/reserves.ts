export interface ReserveData {
  country: string
  code: string
  reserves: number
  production: number
  rpRatio: number
  flag: string
}

export const reservesData: ReserveData[] = [
  { country: 'Venezuela', code: 'VEN', reserves: 303800, production: 750, rpRatio: 405.1, flag: '🇻🇪' },
  { country: 'Saudi Arabia', code: 'SAU', reserves: 258600, production: 10500, rpRatio: 24.6, flag: '🇸🇦' },
  { country: 'Iran', code: 'IRN', reserves: 208600, production: 3200, rpRatio: 65.2, flag: '🇮🇷' },
  { country: 'Canada', code: 'CAN', reserves: 170300, production: 5800, rpRatio: 29.4, flag: '🇨🇦' },
  { country: 'Iraq', code: 'IRQ', reserves: 145000, production: 4400, rpRatio: 33.0, flag: '🇮🇶' },
  { country: 'Russia', code: 'RUS', reserves: 107800, production: 10100, rpRatio: 10.7, flag: '🇷🇺' },
  { country: 'Kuwait', code: 'KWT', reserves: 101500, production: 2700, rpRatio: 37.6, flag: '🇰🇼' },
  { country: 'UAE', code: 'ARE', reserves: 97800, production: 3400, rpRatio: 28.8, flag: '🇦🇪' },
  { country: 'Libya', code: 'LBY', reserves: 48400, production: 1200, rpRatio: 40.3, flag: '🇱🇾' },
  { country: 'Nigeria', code: 'NGA', reserves: 36900, production: 1500, rpRatio: 24.6, flag: '🇳🇬' },
]
