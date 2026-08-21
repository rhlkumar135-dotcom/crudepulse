// Generate simplified SVG path data from Natural Earth 110m GeoJSON
// Uses Equirectangular projection to match our toSVG() function

const W = 900, H = 450

function toSVG(lat: number, lng: number): [number, number] {
  return [((lng + 180) / 360) * W, ((90 - lat) / 180) * H]
}

function pointLineDistance(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function simplify(coords: [number, number][], epsilon: number): [number, number][] {
  if (coords.length <= 2) return coords
  let maxDist = 0, maxIdx = 0
  const start = coords[0], end = coords[coords.length - 1]
  for (let i = 1; i < coords.length - 1; i++) {
    const d = pointLineDistance(coords[i], start, end)
    if (d > maxDist) { maxDist = d; maxIdx = i }
  }
  if (maxDist > epsilon) {
    const left = simplify(coords.slice(0, maxIdx + 1), epsilon)
    const right = simplify(coords.slice(maxIdx), epsilon)
    return [...left.slice(0, -1), ...right]
  }
  return [start, end]
}

function ringToPath(ring: number[][]): string {
  let svgCoords = ring.map(c => toSVG(c[1], c[0])) // GeoJSON is [lng, lat]
  svgCoords = simplify(svgCoords, 1.5)
  return svgCoords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ') + ' Z'
}

// Extract all outer rings from geometry (Polygon or MultiPolygon)
function extractRings(geom: any): number[][][] {
  if (geom.type === 'Polygon') {
    return [geom.coordinates[0]] // outer ring only
  } else if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map((poly: any) => poly[0]) // outer ring of each
  }
  return []
}

async function main() {
  console.log('Downloading Natural Earth countries...')
  const url = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
  const resp = await fetch(url)
  const geo = await resp.json()
  console.log(`Got ${geo.features.length} features`)

  // Map countries to continents by centroid
  function getContinent(avgLng: number, avgLat: number): string {
    // North America: everything west of -30° lng and north of ~10° lat
    if (avgLng > -170 && avgLng < -30 && avgLat > 10) return 'North America'
    if (avgLng > -170 && avgLng < -30 && avgLat <= 10 && avgLat > -56) return 'South America'
    // Europe: -25 to 45 lng, 35+ lat
    if (avgLng > -25 && avgLng < 45 && avgLat > 35) return 'Europe'
    // Africa: -20 to 55 lng, below 38 lat
    if (avgLng > -20 && avgLng < 55 && avgLat <= 38 && avgLat > -36) return 'Africa'
    // Middle East: 25-60 lng, 12-42 lat
    if (avgLng >= 25 && avgLng < 60 && avgLat > 12 && avgLat < 42) return 'Middle East'
    // Asia: everything else east of 45 lng
    if (avgLng >= 45 && avgLat > -12) return 'Asia'
    // Oceania
    if (avgLat < -10 && avgLng > 100) return 'Oceania'
    // Iceland/Greenland
    if (avgLat > 60 && avgLng < -20) return 'North America'
    return 'Other'
  }

  const continents: Record<string, number[][][][]> = {
    'North America': [], 'South America': [], 'Europe': [], 'Africa': [], 'Middle East': [], 'Asia': [], 'Oceania': []
  }

  for (const feat of geo.features) {
    const geom = feat.geometry
    if (!geom) continue

    const rings = extractRings(geom)
    if (rings.length === 0) continue

    // Compute centroid
    let totalLng = 0, totalLat = 0, count = 0
    for (const ring of rings) {
      for (const pt of ring) { totalLng += pt[0]; totalLat += pt[1]; count++ }
    }
    const avgLng = totalLng / count, avgLat = totalLat / count

    const cont = getContinent(avgLng, avgLat)
    if (cont !== 'Other' && continents[cont]) {
      continents[cont].push(rings)
    }
  }

  // Generate SVG paths
  const output: string[] = []
  output.push('// Auto-generated world map paths from Natural Earth 110m countries')
  output.push('// Equirectangular projection: 900x450 viewport')
  output.push('// Source: datasets/geo-countries')
  output.push('')
  output.push('export const WORLD_MAP_PATHS: Record<string, string[]> = {')

  for (const [cont, polys] of Object.entries(continents)) {
    const paths: string[] = []
    for (const rings of polys) {
      for (const ring of rings) {
        if (ring.length < 4) continue
        const path = ringToPath(ring)
        if (path.length > 40) paths.push(path)
      }
    }
    output.push(`  '${cont}': [`)
    for (const p of paths) {
      output.push(`    '${p}',`)
    }
    output.push(`  ],`)
    console.log(`${cont}: ${paths.length} polygons`)
  }

  output.push('}')

  const fs = await import('fs')
  fs.writeFileSync('src/lib/world-map-paths.ts', output.join('\n'))
  const size = (await import('fs')).statSync('src/lib/world-map-paths.ts').size
  console.log(`\nWritten to src/lib/world-map-paths.ts (${(size / 1024).toFixed(1)} KB)`)
}

main().catch(console.error)
