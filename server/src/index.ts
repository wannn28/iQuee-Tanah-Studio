import { env } from './env'
import { createApp } from './app'
import { prisma } from './db'

const server = createApp().listen(env.PORT, () => {
  console.log(`tanah-shop-api listening on :${env.PORT} (${env.NODE_ENV})`)
})

const shutdown = (sig: string) => {
  console.log(`${sig} received, shutting down`)
  server.close(() => { prisma.$disconnect().finally(() => process.exit(0)) })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
