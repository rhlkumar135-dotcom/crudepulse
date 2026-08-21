// Inspect GeoJSON structure
const url = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
const resp = await fetch(url)
const geo = await resp.json()

const feat = geo.features[0]
console.log('Type:', feat.geometry.type)
console.log('Coords length:', feat.geometry.coordinates.length)
console.log('First polygon nesting:')
const c = feat.geometry.coordinates[0]
console.log('  coordinates[0] length:', c.length)
console.log('  coordinates[0][0] sample:', c[0].slice(0, 3))
console.log('  coordinates[0][0] length:', c[0].length)
console.log('  Is c[0][0] a number[]?', typeof c[0][0][0] === 'number')

// Try a few more
for (const f of geo.features.slice(0, 5)) {
  console.log(`\n${f.properties?.ADMIN}: type=${f.geometry.type}, coordinates[0] length=${f.geometry.coordinates[0]?.length}`)
}
