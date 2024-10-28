#!/usr/bin/env node
import { env } from './script-init.mjs'
import { ManagementClient } from '@synqly/client-sdk'
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

await deleteAccounts()
await deleteIntegrationPoints()

async function deleteAccounts() {
  console.log('\nCleaning up demo accounts ...')

  const { body: demoAccounts, error } = await org.accounts.list({
    filter: [`name[like]~${env.DEMO_PREFIX}%`, 'environment[eq]test'],
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
  console.log('\nCleaning up demo integration points ...')
  const { body: demoPoints, error } = await org.integrationPoints.list({
    filter: `name[like]${env.DEMO_PREFIX}%`,
  })

  if (error) {
    throw new Error('Unable to list demo integration points', { cause: error })
  }

  if (!demoPoints.result.length) {
    console.log('Nothing to clean up.')
    return
  }

  const { body: demoIntegrations, error: integrationsError } =
    await org.integrations.list({
      filter: `integration_point_id[in]${demoPoints.result.map(({ id }) => id).join(',')}`,
    })

  if (integrationsError) {
    throw new Error('Unable to list demo integrations', {
      cause: integrationsError,
    })
  }

  for (const integration of demoIntegrations.result) {
    const { error } = await org.integrations.delete(
      integration.accountId,
      integration.id,
    )

    if (error) {
      throw error
    }
  }

  for (const integrationPoint of demoPoints.result) {
    const { error } = await org.integrationPoints.delete(integrationPoint.id)
    if (error) {
      throw error
    }

    console.log(`- ${integrationPoint.fullname} (${integrationPoint.id})`)
  }
}
