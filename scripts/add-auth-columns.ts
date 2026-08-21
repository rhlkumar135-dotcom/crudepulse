import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  const client = await pool.connect()
  try {
    const queries = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP`,
    ]
    for (const q of queries) {
      await client.query(q)
      console.log(`✅ ${q.split(' ')[5]}`)
    }
    // Confirm columns exist
    const res = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users' ORDER BY ordinal_position
    `)
    console.log('\nUsers table columns:')
    for (const r of res.rows) {
      console.log(`  ${r.column_name}: ${r.data_type}`)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
