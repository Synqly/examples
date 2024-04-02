#!/usr/bin/env node
import { Management, ManagementClient } from '@synqly/client-sdk'
import { faker } from '@faker-js/faker'
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import slug from 'slug'

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

const NUM_DEMO_ACCOUNTS = Number(process.env.NUM_DEMO_ACCOUNTS ?? 5)

const org = new ManagementClient({
  token: SYNQLY_ORG_TOKEN,
  environment: NEXT_PUBLIC_SYNQLY_API_ROOT,
})

console.log('\nEnsuring demo accounts ...')
await ensureAccounts(org, NUM_DEMO_ACCOUNTS)

console.log('\nEnsuring demo integration points ...')
await ensureIntegrationPoints(org, [
  {
    name: NEXT_PUBLIC_AUDIT_LOG_EXPORT_ID,
    fullname: 'Audit Log Export',
    connector: 'siem',
    // Allow any providers for this integration point
    environments: {
      test: ['*'],
      prod: ['*'],
    },
  },
  {
    name: NEXT_PUBLIC_SLACK_NOTIFICATIONS_ID,
    fullname: 'Slack Notifications',
    connector: 'notifications',
    // Only allow the slack provider for this integration point
    environments: {
      test: ['notifications_slack'],
      prod: ['notifications_slack'],
    },
  },
])

console.log('\nDone. Run scripts/clean-demo-data.mjs to clean up.')

/**
 * @param {ManagementClient} management
 * @param {Management.CreateIntegrationPointRequest[]} integrationPointsData
 */
async function ensureIntegrationPoints(management, integrationPointsData) {
  const demoList = [
    NEXT_PUBLIC_AUDIT_LOG_EXPORT_ID,
    NEXT_PUBLIC_SLACK_NOTIFICATIONS_ID,
  ]
  const { body: existingPoints } = await management.integrationPoints.list({
    filter: `name[in]${demoList}`,
  })

  console.log(`Found ${existingPoints.result.length} demo integration points`)
  for (const integrationPoint of existingPoints.result) {
    console.log(`- ${integrationPoint.fullname} (${integrationPoint.name})`)
  }

  if (existingPoints.result.length < demoList.length) {
    console.log(
      `Creating ${demoList.length - existingPoints.result.length} new integration points ...`,
    )
    for (const data of integrationPointsData) {
      const existing = existingPoints.result.find(
        ({ name }) => name === data.name,
      )

      if (!existing) {
        const { body, error } = await management.integrationPoints.create(data)
        if (error) {
          throw error
        }

        const integrationPoint = body.result
        console.log(`- ${integrationPoint.fullname} (${integrationPoint.id})`)
      }
    }
  }
}

/**
 * @typedef {{ id: string; fullname: string }} Account
 * @param {ManagementClient} management
 * @param {number} minCount
 */
async function ensureAccounts(management, minCount) {
  const { body: existingAccounts } = await management.accounts.list({
    filter: `name[like]${DEMO_PREFIX}%`,
  })

  console.log(`Found ${existingAccounts.result.length} demo accounts`)
  for (const account of existingAccounts.result) {
    console.log(`- ${account.fullname} (${account.id}}`)
  }

  const additionalCount = minCount - existingAccounts.result.length

  if (additionalCount > 0) {
    console.log(`Creating ${additionalCount} new accounts ...`)
    const accountNames = faker.helpers.uniqueArray(
      faker.company.name,
      additionalCount,
    )

    for (const fullname of accountNames) {
      const { body, error } = await management.accounts.create({
        name: `${DEMO_PREFIX}${slug(fullname)}`,
        fullname,
        environment: 'test',
      })

      if (error) {
        throw new Error('unable to create account', { cause: error })
      }

      const { account } = body.result
      console.log(`- ${account.fullname} (${account.id})`)
    }
  }
}
