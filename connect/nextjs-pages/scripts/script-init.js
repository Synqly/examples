import { config } from 'dotenv'
import { initEnv } from '../lib/init-demo-env.js'

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load env vars from .env.local
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env.local'),
})

export const env = initEnv(process.env)

process.on('uncaughtException', handleUnexpectedError)
process.on('unhandledRejection', (reason) =>
  handleUnexpectedError({ message: reason }),
)

function handleUnexpectedError({ message, cause = '' }) {
  console.error(`
    Oops – something went wrong!

    Don't worry, your organization is safe.

    This likely happened because ${
      env.SYNQLY_ORG_TOKEN
        ? 'SYNQLY_ORG_TOKEN is set to an invalid organization access token.'
        : 'SYNQLY_ORG_TOKEN is not set.'
    }

    Please check your .env.local and consult README.md for more detail on
    how to set up this demo.

    Error: ${message}
    ${cause ? JSON.stringify(cause) : ''}
  `)
}
