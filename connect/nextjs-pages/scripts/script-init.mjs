import { config } from 'dotenv'
import { initEnv } from './init-demo-env.mjs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleUnexpectedError } from './utils.mjs'

// Load env vars from .env.local
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env.local'),
})

export const env = initEnv(process.env)

process.on('uncaughtException', ({ message, cause }) => {
  handleUnexpectedError({ message, cause, env })
})

process.on('unhandledRejection', (reason) =>
  handleUnexpectedError({ message: reason, env }),
)
