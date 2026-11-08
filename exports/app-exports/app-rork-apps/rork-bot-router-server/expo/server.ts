import { serve } from '@hono/node-server'
import app from './backend/hono'

const port = Number(process.env.PORT) || 3000

console.log('🚀 Starting backend server...')
console.log('📍 Environment:', {
  PORT: port,
  HAS_DB_ENDPOINT: !!process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT,
  HAS_DB_TOKEN: !!process.env.EXPO_PUBLIC_RORK_DB_TOKEN,
})

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
}, (info) => {
  console.log(`✅ Backend running on http://192.168.1.153:${info.port}`)
  console.log(`✅ tRPC endpoint: http://192.168.1.153:${info.port}/api/trpc`)
  console.log(`✅ Health check: http://192.168.1.153:${info.port}/`)
})

export default app
