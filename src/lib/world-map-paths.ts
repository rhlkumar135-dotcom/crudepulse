// World map data for CrudePulses — real outlines, oil regions, chokepoints, trade flows
// viewBox: 0 0 960 500 — equirectangular projection

export function latLngToSvg(lat: number, lng: number): [number, number] {
  const x = (lng + 180) * (960 / 360)
  const y = (90 - lat) * (500 / 180)
  return [x, y]
}

export function flowPath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.15
  return `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`
}

// ═══ Continent Outlines (Natural Earth 110m simplified) ═══

export const WORLD_MAP_PATHS: { d: string; label: string; centroidX: number; centroidY: number }[] = [
  {
    label: 'North America',
    centroidX: 240, centroidY: 170,
    d: 'M130,85 L155,72 L185,68 L210,58 L235,55 L260,52 L275,58 L290,65 L310,68 L325,78 L335,95 L340,110 L338,125 L330,138 L318,148 L305,155 L295,165 L280,175 L270,188 L258,198 L245,210 L238,225 L232,235 L228,248 L222,258 L218,268 L215,278 L210,285 L202,292 L195,298 L188,305 L182,312 L178,318 L175,312 L170,305 L165,298 L158,290 L152,285 L145,280 L138,275 L132,268 L128,258 L125,248 L122,238 L120,228 L118,218 L116,208 L115,198 L116,188 L118,178 L120,168 L122,155 L125,142 L128,128 L130,115 L130,100 Z'
  },
  {
    label: 'South America',
    centroidX: 290, centroidY: 340,
    d: 'M255,290 L265,288 L278,292 L290,298 L302,308 L312,318 L318,328 L322,340 L325,352 L325,365 L322,378 L318,390 L312,402 L305,412 L298,420 L290,428 L282,435 L275,440 L268,445 L262,448 L258,445 L255,438 L252,428 L250,418 L248,408 L246,398 L245,388 L244,378 L244,368 L245,358 L248,348 L250,338 L252,328 L253,318 L254,308 L255,298 Z'
  },
  {
    label: 'Europe',
    centroidX: 490, centroidY: 130,
    d: 'M455,72 L465,68 L478,65 L490,68 L502,72 L512,78 L520,85 L528,92 L535,100 L538,108 L540,118 L542,128 L540,138 L535,148 L528,155 L520,162 L510,168 L500,172 L490,175 L480,178 L470,175 L462,170 L455,162 L450,155 L445,148 L442,140 L440,132 L440,122 L442,112 L445,102 L448,92 L452,82 Z'
  },
  {
    label: 'Africa',
    centroidX: 500, centroidY: 310,
    d: 'M465,210 L478,208 L492,210 L505,215 L515,222 L525,232 L532,242 L538,255 L542,268 L545,282 L546,295 L545,308 L542,322 L538,335 L532,348 L525,358 L518,368 L510,378 L502,385 L492,390 L482,392 L472,388 L462,382 L455,372 L448,362 L442,350 L438,338 L435,325 L434,312 L435,298 L438,285 L442,272 L448,258 L452,245 L458,232 L462,220 Z'
  },
  {
    label: 'Middle East',
    centroidX: 560, centroidY: 230,
    d: 'M535,195 L545,192 L555,195 L565,200 L575,208 L582,218 L588,228 L590,240 L588,252 L582,260 L575,268 L565,272 L555,275 L545,272 L538,265 L532,255 L528,245 L525,235 L525,225 L528,215 L532,205 Z'
  },
  {
    label: 'Russia',
    centroidX: 620, centroidY: 95,
    d: 'M540,55 L560,52 L580,48 L600,45 L620,42 L640,42 L660,45 L680,50 L700,55 L720,62 L740,68 L758,75 L770,82 L778,92 L782,102 L780,112 L775,122 L768,130 L758,138 L745,142 L730,145 L715,148 L700,150 L685,148 L670,145 L655,140 L640,138 L625,135 L610,132 L595,128 L580,122 L565,115 L552,108 L542,98 L538,88 L538,75 L540,65 Z'
  },
  {
    label: 'China',
    centroidX: 690, centroidY: 185,
    d: 'M640,145 L655,142 L670,145 L685,148 L700,155 L710,162 L718,172 L722,182 L725,192 L722,202 L718,212 L710,220 L700,225 L688,228 L675,228 L662,225 L650,220 L640,212 L632,202 L628,192 L626,182 L628,172 L632,162 L636,152 Z'
  },
  {
    label: 'Japan',
    centroidX: 760, centroidY: 175,
    d: 'M748,152 L755,155 L760,160 L765,168 L768,175 L770,182 L768,190 L765,198 L760,205 L755,210 L750,208 L746,202 L743,195 L741,188 L740,180 L741,172 L743,165 L746,158 Z'
  },
  {
    label: 'India',
    centroidX: 650, centroidY: 255,
    d: 'M630,210 L640,208 L650,212 L660,218 L668,228 L672,238 L674,248 L672,258 L668,268 L662,278 L655,288 L648,295 L640,298 L632,295 L625,288 L620,278 L618,268 L618,258 L620,248 L622,238 L625,228 L628,218 Z'
  },
  {
    label: 'Southeast Asia',
    centroidX: 720, centroidY: 305,
    d: 'M695,260 L705,258 L715,262 L722,270 L728,280 L732,290 L735,300 L735,310 L732,320 L728,328 L720,332 L712,330 L705,325 L698,318 L692,308 L688,298 L688,288 L690,278 L692,268 Z'
  },
  {
    label: 'Australia',
    centroidX: 770, centroidY: 385,
    d: 'M735,355 L750,350 L765,352 L778,358 L790,368 L798,378 L802,390 L800,402 L795,412 L785,420 L772,425 L758,422 L745,415 L735,405 L728,395 L725,385 L725,375 L728,365 L732,358 Z'
  },
  {
    label: 'Greenland',
    centroidX: 340, centroidY: 60,
    d: 'M315,30 L328,28 L342,30 L355,35 L365,42 L372,52 L375,62 L372,72 L365,80 L355,85 L342,88 L330,85 L320,80 L312,72 L308,62 L308,52 L310,42 L312,35 Z'
  },
  {
    label: 'UK',
    centroidX: 475, centroidY: 118,
    d: 'M470,105 L475,102 L480,105 L483,112 L485,118 L483,125 L480,130 L475,132 L470,130 L467,125 L465,118 L467,112 Z'
  },
  {
    label: 'Iceland',
    centroidX: 440, centroidY: 80,
    d: 'M428,75 L435,72 L442,72 L448,75 L452,80 L450,85 L445,88 L438,88 L432,85 L428,80 Z'
  },
  {
    label: 'Indonesia',
    centroidX: 730, centroidY: 328,
    d: 'M708,320 L718,318 L728,320 L738,322 L748,325 L755,328 L760,332 L755,335 L745,336 L735,335 L725,333 L715,330 L710,326 Z'
  },
  {
    label: 'Madagascar',
    centroidX: 555, centroidY: 380,
    d: 'M550,365 L555,362 L560,365 L563,372 L565,380 L563,388 L560,395 L555,398 L550,395 L548,388 L547,380 L548,372 Z'
  },
  {
    label: 'New Zealand',
    centroidX: 835, centroidY: 420,
    d: 'M830,405 L835,402 L838,408 L840,415 L840,422 L838,428 L835,432 L830,430 L828,425 L827,418 L828,412 Z'
  },
]

// ═══ Oil Regions ═══

export const OIL_REGIONS = [
  { name: 'Persian Gulf', lat: 26.5, lng: 52.0, color: '#F5A623', production: '32M bbl/d' },
  { name: 'Permian Basin', lat: 31.9, lng: -102.2, color: '#22C55E', production: '6.2M bbl/d' },
  { name: 'West Texas', lat: 31.9, lng: -102.2, color: '#22C55E', production: '5.5M bbl/d' },
  { name: 'Gulf of Mexico', lat: 25.5, lng: -90.0, color: '#2DD4BF', production: '1.9M bbl/d' },
  { name: 'North Sea', lat: 60.0, lng: 2.0, color: '#3B82F6', production: '2.1M bbl/d' },
  { name: 'Niger Delta', lat: 4.5, lng: 6.5, color: '#EF4444', production: '1.5M bbl/d' },
  { name: 'Sahara', lat: 23.0, lng: 10.0, color: '#F5A623', production: '1.2M bbl/d' },
  { name: 'Urals', lat: 56.0, lng: 60.0, color: '#D946EF', production: '9.2M bbl/d' },
  { name: 'West Siberia', lat: 60.0, lng: 70.0, color: '#D946EF', production: '8.5M bbl/d' },
  { name: 'East China Sea', lat: 28.0, lng: 125.0, color: '#F5A623', production: '0.5M bbl/d' },
  { name: 'South China Sea', lat: 15.0, lng: 114.0, color: '#F5A623', production: '1.2M bbl/d' },
  { name: 'Guyana Stabroek', lat: 7.0, lng: -54.0, color: '#22C55E', production: '0.6M bbl/d' },
  { name: 'Brazil Pre-Salt', lat: -25.0, lng: -40.0, color: '#22C55E', production: '3.8M bbl/d' },
  { name: 'Caspian', lat: 42.0, lng: 51.0, color: '#F5A623', production: '2.0M bbl/d' },
]

// ═══ Chokepoints ═══

export const CHOKEPOINTS = [
  { name: 'Hormuz', lat: 26.5, lng: 56.3, color: '#F5A623', bpd: '21M bbl/d' },
  { name: 'Suez', lat: 30.0, lng: 32.5, color: '#F5A623', bpd: '5.5M bbl/d' },
  { name: 'Bab el-Mandeb', lat: 12.6, lng: 43.3, color: '#EF4444', bpd: '6.2M bbl/d' },
  { name: 'Malacca', lat: 2.5, lng: 101.5, color: '#22C55E', bpd: '16M bbl/d' },
  { name: 'Panama', lat: 9.1, lng: -79.7, color: '#3B82F6', bpd: '1.0M bbl/d' },
]

// ═══ Trade Flows ═══

export const TRADE_FLOWS = [
  { from: 'Middle East', fromLat: 26.5, fromLng: 52.0, to: 'Asia Pacific', toLat: 25.0, toLng: 120.0, volume: 20, color: '#F5A623' },
  { from: 'Middle East', fromLat: 26.5, fromLng: 52.0, to: 'Europe', toLat: 52.0, toLng: 10.0, volume: 8, color: '#F5A623' },
  { from: 'Middle East', fromLat: 26.5, fromLng: 52.0, to: 'Americas', toLat: 30.0, toLng: -90.0, volume: 3, color: '#F5A623' },
  { from: 'Russia', fromLat: 56.0, fromLng: 60.0, to: 'Europe', toLat: 52.0, toLng: 10.0, volume: 5, color: '#D946EF' },
  { from: 'Russia', fromLat: 56.0, fromLng: 60.0, to: 'Asia Pacific', toLat: 35.0, toLng: 140.0, volume: 4, color: '#D946EF' },
  { from: 'Americas', fromLat: 30.0, fromLng: -90.0, to: 'Europe', toLat: 52.0, toLng: 10.0, volume: 4, color: '#22C55E' },
  { from: 'Americas', fromLat: 30.0, fromLng: -90.0, to: 'Asia Pacific', toLat: 35.0, toLng: 140.0, volume: 2, color: '#22C55E' },
  { from: 'Africa', fromLat: 4.5, fromLng: 6.5, to: 'Asia Pacific', toLat: 25.0, toLng: 120.0, volume: 3, color: '#EF4444' },
  { from: 'Africa', fromLat: 4.5, fromLng: 6.5, to: 'Europe', toLat: 52.0, toLng: 10.0, volume: 2, color: '#EF4444' },
  { from: 'North Sea', fromLat: 60.0, fromLng: 2.0, to: 'Europe', toLat: 52.0, toLng: 10.0, volume: 2, color: '#3B82F6' },
  { from: 'Brazil', fromLat: -25.0, fromLng: -40.0, to: 'Asia Pacific', toLat: 25.0, toLng: 120.0, volume: 2, color: '#22C55E' },
  { from: 'Brazil', fromLat: -25.0, fromLng: -40.0, to: 'Americas', toLat: 30.0, toLng: -90.0, volume: 1, color: '#22C55E' },
]

// ═══ Flow Colors ═══

export const FLOW_COLORS: Record<string, string> = {
  '#F5A623': 'Middle East',
  '#D946EF': 'Russia',
  '#22C55E': 'Americas',
  '#EF4444': 'Africa',
  '#3B82F6': 'North Sea',
}
