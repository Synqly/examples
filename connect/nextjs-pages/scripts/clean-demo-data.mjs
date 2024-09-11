#!/usr/bin/env node
import { env } from './script-init.js'
import { Management, ManagementClient } from '@synqly/client-sdk'
import { faker } from '@faker-js/faker'
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load env vars from .env.local
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env.local'),
})

const org = new ManagementClient({
  token: env.SYNQLY_ORG_TOKEN,
  environment: env.NEXT_PUBLIC_SYNQLY_API_ROOT,
})

console.log('\nCleaning up demo accounts ...')
await deleteAccounts()

console.log('\nCleaning up demo integration points ...')
await deleteIntegrationPoints()

async function deleteAccounts() {
  const { body: demoAccounts, error } = await org.accounts.list({
    filter: [`name[like]${env.DEMO_PREFIX}%`, 'environment[eq]test'],
  })

  if (error) {
    throw new Error('Unable to delete accounts', { cause: error })
  }

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
  const { body: demoPoints, error } = await org.integrationPoints.list({
    filter: `name[in]${[env.AUDIT_LOG_EXPORT_ID, env.SLACK_NOTIFICATIONS_ID]}`,
  })

  if (error) {
    throw new Error('Unable to delete integration points', { cause: error })
  }

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
