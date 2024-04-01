#!/usr/bin/env node
import { Management, ManagementClient } from '@synqly/client-sdk'
import { faker } from '@faker-js/faker'
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load env vars from .env.local
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env.local'),
})

const {
  SYNQLY_ORG_TOKEN,
  NEXT_PUBLIC_SYNQLY_API_ROOT,
  NEXT_PUBLIC_AUDIT_LOG_EXPORT_ID,
  NEXT_PUBLIC_SLACK_NOTIFICATIONS_ID,
  DEMO_PREFIX,
} = process.env

const org = new ManagementClient({
  token: SYNQLY_ORG_TOKEN,
  environment: NEXT_PUBLIC_SYNQLY_API_ROOT,
})

console.log('\nCleaning up demo accounts ...')
await deleteAccounts()

console.log('\nCleaning up demo integration points ...')
await deleteIntegrationPoints()

async function deleteAccounts() {
  const { body: demoAccounts } = await org.accounts.list({
    filter: `name[like]${DEMO_PREFIX}%`,
  })

  if (!demoAccounts.result.length) {
    console.log('Nothing to clean up.')
    return
  }

  for (const account of demoAccounts.result) {
    const { error } = await org.accounts.delete(account.id)
    if (error) {
      throw error
    }

    console.log(`- ${account.fullname} (${account.id})`)
  }
}

async function deleteIntegrationPoints() {
  const { body: demoPoints } = await org.integrationPoints.list({
    filter: `name[in]${[NEXT_PUBLIC_AUDIT_LOG_EXPORT_ID, NEXT_PUBLIC_SLACK_NOTIFICATIONS_ID]}`,
  })

  if (!demoPoints.result.length) {
    console.log('Nothing to clean up.')
    return
  }

  for (const integrationPoint of demoPoints.result) {
    const { error } = await org.integrationPoints.delete(integrationPoint.id)
    if (error) {
      throw error
    }

    console.log(`- ${integrationPoint.fullname} (${integrationPoint.id})`)
  }
}
