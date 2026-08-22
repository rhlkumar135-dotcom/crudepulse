export const WORLD_MAP_PATHS: { path: string; name?: string }[] = [
  { path: "M120,62 L124,60 L130,60 L136,58 L140,56 L146,54 L150,50 L152,46 L148,44 L144,42 L140,40 L136,38 L130,36 L126,38 L122,40 L118,44 L116,48 L114,52 L116,56 L118,60 Z", name: "Russia-Asia" },
  { path: "M234,32 L240,30 L248,28 L256,26 L264,28 L270,32 L276,38 L280,44 L278,48 L272,52 L264,54 L256,52 L248,48 L240,44 L236,38 Z", name: "China" },
  { path: "M264,54 L272,52 L280,54 L284,58 L286,64 L284,70 L278,74 L270,72 L264,68 L260,62 L262,56 Z", name: "India" },
  { path: "M146,16 L152,14 L160,12 L168,14 L172,18 L170,24 L164,28 L156,30 L148,28 L144,24 L144,18 Z", name: "Scandinavia" },
  { path: "M138,28 L144,24 L148,28 L156,30 L160,34 L158,38 L152,42 L146,44 L140,42 L136,38 L134,34 Z", name: "Europe" },
  { path: "M152,42 L158,38 L164,40 L170,42 L176,46 L180,50 L178,56 L172,60 L164,62 L156,58 L150,52 L148,46 Z", name: "Middle-East" },
  { path: "M156,62 L164,60 L172,62 L178,66 L182,72 L180,80 L176,88 L170,96 L162,100 L154,96 L148,88 L146,80 L148,72 L150,66 Z", name: "Africa" },
  { path: "M162,100 L170,96 L176,100 L180,106 L178,112 L172,116 L164,118 L156,114 L152,108 L156,102 Z", name: "South-Africa" },
  { path: "M40,22 L48,18 L56,16 L64,18 L72,22 L80,28 L86,34 L90,40 L88,46 L82,50 L74,52 L66,50 L58,46 L50,40 L44,34 L42,28 Z", name: "North-America" },
  { path: "M58,46 L66,50 L72,54 L76,60 L78,68 L76,76 L72,84 L66,90 L60,94 L54,90 L50,82 L48,74 L50,66 L52,58 L54,50 Z", name: "South-America" },
  { path: "M250,76 L258,72 L266,74 L272,78 L276,84 L274,90 L268,94 L260,92 L254,88 L250,82 Z", name: "Southeast-Asia" },
  { path: "M284,100 L292,96 L300,98 L306,102 L308,108 L304,114 L296,116 L288,112 L284,106 Z", name: "Australia" },
]

export const OIL_REGIONS = [
  { name: "Persian Gulf", lat: 26.5, lng: 56.3, production: "21M bbl/d", radius: 12, threat: "elevated" as const },
  { name: "Permian Basin", lat: 31.7, lng: -103.2, production: "5.8M bbl/d", radius: 10, threat: "clear" as const },
  { name: "Gulf of Mexico", lat: 27.5, lng: -90.5, production: "2.0M bbl/d", radius: 10, threat: "watch" as const },
  { name: "Niger Delta", lat: 5.0, lng: 6.0, production: "1.5M bbl/d", radius: 8, threat: "elevated" as const },
  { name: "North Sea", lat: 60.0, lng: 2.0, production: "1.8M bbl/d", radius: 10, threat: "clear" as const },
  { name: "Urals-Volga", lat: 54.0, lng: 50.0, production: "3.2M bbl/d", radius: 10, threat: "elevated" as const },
  { name: "West Siberia", lat: 62.0, lng: 70.0, production: "4.5M bbl/d", radius: 12, threat: "elevated" as const },
  { name: "Alberta Oil Sands", lat: 56.7, lng: -111.4, production: "3.5M bbl/d", radius: 10, threat: "clear" as const },
]

export const CHOKEPOINTS = [
  { name: "Strait of Hormuz", lat: 26.5, lng: 56.3, throughput: "21M bbl/d", risk: "Iran tensions, mine warfare" },
  { name: "Suez Canal", lat: 30.0, lng: 32.5, throughput: "9M bbl/d", risk: "Houthi attacks, congestion" },
  { name: "Bab el-Mandeb", lat: 12.6, lng: 43.3, throughput: "6.5M bbl/d", risk: "Pirate activity, Houthi drones" },
  { name: "Strait of Malacca", lat: 2.5, lng: 101.5, throughput: "16M bbl/d", risk: "Naval tensions, piracy" },
  { name: "Panama Canal", lat: 9.4, lng: -79.9, throughput: "1M bbl/d", risk: "Drought restrictions" },
]

export const TRADE_FLOWS = [
  { from: { lat: 26.5, lng: 56.3 }, to: { lat: 31.2, lng: 121.5 }, volume: "4.2M bbl/d", name: "ME → China", region: "middle-east" },
  { from: { lat: 26.5, lng: 56.3 }, to: { lat: 19.1, lng: 73.0 }, volume: "3.5M bbl/d", name: "ME → India", region: "middle-east" },
  { from: { lat: 26.5, lng: 56.3 }, to: { lat: 51.5, lng: -0.1 }, volume: "1.2M bbl/d", name: "ME → Europe", region: "middle-east" },
  { from: { lat: 26.5, lng: 56.3 }, to: { lat: 25.0, lng: 121.5 }, volume: "1.8M bbl/d", name: "ME → Japan/Korea", region: "middle-east" },
  { from: { lat: 62.0, lng: 70.0 }, to: { lat: 51.5, lng: 10.0 }, volume: "1.5M bbl/d", name: "Russia → Europe", region: "russia" },
  { from: { lat: 62.0, lng: 70.0 }, to: { lat: 31.2, lng: 121.5 }, volume: "1.8M bbl/d", name: "Russia → China", region: "russia" },
  { from: { lat: 31.7, lng: -103.2 }, to: { lat: 29.8, lng: -95.4 }, volume: "3.5M bbl/d", name: "US Gulf Exports", region: "americas" },
  { from: { lat: 56.7, lng: -111.4 }, to: { lat: 29.8, lng: -95.4 }, volume: "0.8M bbl/d", name: "Canada → US Gulf", region: "americas" },
  { from: { lat: 5.0, lng: 6.0 }, to: { lat: 51.5, lng: 0.0 }, volume: "0.8M bbl/d", name: "Nigeria → Europe", region: "africa" },
  { from: { lat: 30.0, lng: 47.5 }, to: { lat: 31.2, lng: 121.5 }, volume: "1.2M bbl/d", name: "Iraq → China", region: "middle-east" },
]

export const FLOW_COLORS: Record<string, string> = {
  "middle-east": "#F59E0B", "russia": "#EF4444", "americas": "#14B8A6", "africa": "#8B5CF6",
}

export function latLngToSvg(lat: number, lng: number, w = 320, h = 160): { x: number; y: number } {
  const x = ((lng + 180) / 360) * w
  const y = ((90 - lat) / 180) * h
  return { x, y }
}

export function flowPath(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
  const f = latLngToSvg(from.lat, from.lng)
  const t = latLngToSvg(to.lat, to.lng)
  const mx = (f.x + t.x) / 2
  const my = (f.y + t.y) / 2 - Math.abs(f.x - t.x) * 0.15
  return `M${f.x},${f.y} Q${mx},${my} ${t.x},${t.y}`
}
