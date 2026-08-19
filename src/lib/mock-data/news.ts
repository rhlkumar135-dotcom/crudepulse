export interface NewsItem {
  id: string
  title: string
  source: string
  time: string
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  category: string
  relatedPrice?: number
}

export const mockNews: NewsItem[] = [
  { id: '1', title: 'OPEC+ Agrees to Gradual Output Increase Starting October', source: 'Reuters', time: '2h ago', sentiment: 'negative', score: -0.6, category: 'OPEC', relatedPrice: 71.2 },
  { id: '2', title: 'US Crude Inventories Fall by 4.2M Barrels, Exceeding Expectations', source: 'EIA', time: '4h ago', sentiment: 'positive', score: 0.7, category: 'Supply', relatedPrice: 73.1 },
  { id: '3', title: 'Hurricane Watch Issued for Gulf of Mexico Production Zones', source: 'NOAA', time: '5h ago', sentiment: 'negative', score: -0.8, category: 'Weather', relatedPrice: 74.5 },
  { id: '4', title: 'China Refinery Throughput Rises 3.1% Year-on-Year in July', source: 'Bloomberg', time: '6h ago', sentiment: 'positive', score: 0.5, category: 'Demand' },
  { id: '5', title: 'Tensions Escalate in Strait of Hormuz After Naval Incident', source: 'AP News', time: '7h ago', sentiment: 'negative', score: -0.9, category: 'Geopolitical', relatedPrice: 76.2 },
  { id: '6', title: 'US Rig Count Drops by 3 to 472, Lowest Since March', source: 'Baker Hughes', time: '8h ago', sentiment: 'neutral', score: 0.1, category: 'Production' },
  { id: '7', title: 'Fed Signals Potential Rate Cut, Boosting Commodity Outlook', source: 'CNBC', time: '10h ago', sentiment: 'positive', score: 0.6, category: 'Macro' },
  { id: '8', title: 'Libya Resumes Exports from Sharara Field After Brief Shutdown', source: 'Reuters', time: '12h ago', sentiment: 'negative', score: -0.4, category: 'Supply' },
  { id: '9', title: 'Indian Oil Imports from Russia Decline Amid Sanctions Pressure', source: 'Financial Times', time: '14h ago', sentiment: 'neutral', score: -0.2, category: 'Trade' },
  { id: '10', title: 'EIA Raises 2026 Brent Crude Forecast to $78/bbl', source: 'EIA', time: '16h ago', sentiment: 'positive', score: 0.4, category: 'Forecast' },
  { id: '11', title: 'Red Sea Shipping Disruptions Continue as Houthi Attacks Persist', source: 'Guardian', time: '18h ago', sentiment: 'negative', score: -0.7, category: 'Shipping' },
  { id: '12', title: 'Permian Basin Output Hits Record 6.2M bbl/d in August', source: 'EIA', time: '1d ago', sentiment: 'neutral', score: 0.2, category: 'Production' },
  { id: '13', title: 'EU Announces New Sanctions on Russian Oil Traders', source: 'Reuters', time: '1d ago', sentiment: 'negative', score: -0.5, category: 'Sanctions' },
  { id: '14', title: 'Brazil Pre-Salt Output Surpasses 2.5M bbl/d Milestone', source: 'Bloomberg', time: '1d ago', sentiment: 'positive', score: 0.5, category: 'Production' },
  { id: '15', title: 'Crude Oil Futures Rise on Middle East Supply Concerns', source: 'MarketWatch', time: '1d ago', sentiment: 'positive', score: 0.3, category: 'Prices' },
]
