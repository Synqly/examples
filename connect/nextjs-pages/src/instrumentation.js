// @ts-nocheck
import { initEnv } from '@/scripts/init-demo-env.mjs'
import { handleUnexpectedError } from '@/scripts/utils.mjs'
import { ManagementClient } from '@synqly/client-sdk'
import { error, wait } from 'next/dist/build/output/log'

export { register }

async function register() {
  try {
    const demoEnv = initEnv(process.env)

    wait('Initializing demo environment variables ...')
    for (const [key, value] of Object.entries(demoEnv)) {
      process.env[key] = value
    }

    wait('Validating SYNQLY_ORG_TOKEN ...')
    const client = new ManagementClient({
      token: String(process.env.SYNQLY_ORG_TOKEN),
      environment: String(process.env.NEXT_PUBLIC_SYNQLY_API_ROOT),
    })

    const accounts = await client.accounts.list({
      filter: 'environment[eq]test',
    })

    if (!accounts.ok) {
      throw new Error('Unable to validate SYNQLY_ORG_TOKEN')
    }
  } catch ({ message }) {
    handleUnexpectedError({ message, env: process.env }, { error })
    process.exit(1)
  }
}
