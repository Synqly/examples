#!/usr/bin/env node
import { env } from './script-init.js'
import { Management, ManagementClient } from '@synqly/client-sdk'
import { faker } from '@faker-js/faker'
import slug from 'slug'

if (!env.SYNQLY_ORG_TOKEN) {
  console.error(`
    SYNQLY_ORG_TOKEN must be set to a Synqly Organization access token for
    this script to work. Please consult the authentication guide for more
    detail: https://docs.synqly.com/reference/api-authentication
  `)
}

const managementClient = new ManagementClient({
  token: env.SYNQLY_ORG_TOKEN,
  environment: env.NEXT_PUBLIC_SYNQLY_API_ROOT,
})

console.log('\nEnsuring demo accounts ...')
await ensureAccounts(managementClient, env.NUM_ACCOUNTS)

console.log('\nEnsuring demo integration points ...')
await ensureIntegrationPoints(managementClient, [
  {
    // The name acts as a slug, or human friendly identifier. If not
    // specified, it will have the same value as the automatically
    // generated `id` field.
    name: env.AUDIT_LOG_EXPORT_ID,

    // The `fullname` of an integration point is used within Connect UI to
    // render the heading of the integration point.
    fullname: 'Audit Log Export',

    // The `connector` defines which category of connector this integration
    // point (and any integrations associated with it) will use.
    connector: 'siem',

    // We recommend setting a description for your integration points. We
    // don't render this description anywhere in the Connect UI experience,
    // but you may choose to do so in your application UI. In this demo
    // application, it's rendered in the list of integration points.
    description:
      'Audit Logs are retained for 24 hours. Add an integration to store them longer.',

    // The `environments` field lets you define allowed provider
    // configurations in specific environments. At least one environment
    // has to be specified. NOTE: if an environment is *not* specified then
    // no providers will be allowed in that environment. The same holds
    // true for an empty array. We recommend using `['*']` unless you have
    // specific reasons to lock this down to a specific set of allowed
    // provider types.
    environments: {
      test: ['*'],
      prod: ['*'],
    },
  },
  {
    name: env.SLACK_NOTIFICATIONS_ID,
    fullname: 'Slack Notifications',
    connector: 'notifications',
    description:
      'This integration point only supports Slack as the provider, and will not display a provider selection screen.',

    // For this provider we only allow the Slack provider. This means
    // Connect UI will go directly to the provider configuration screen,
    // since there's no point showing a list of providers when there's only
    // one. This can be used to create integration points for specific
    // providers.
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
  const demoList = [env.AUDIT_LOG_EXPORT_ID, env.SLACK_NOTIFICATIONS_ID]
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
 * This function checks to see that the organization has a minimum number of
 * demo accounts set up. Demo accounts are marked with the given `prefix`
 * (defaults to `DEMO_PREFIX`) and also belong to the `test` environment.
 *
 * @param {ManagementClient} management
 * @param {number} minCount
 * @param {string} prefix
 */
async function ensureAccounts(management, minCount, prefix = env.DEMO_PREFIX) {
  const { body: existingAccounts, error: existingAccountsError } =
    await management.accounts.list({
      filter: [`name[like]${prefix}%`, 'environment[eq]test'],
    })

  if (existingAccountsError) {
    throw new Error('Unable to list existing accounts.', {
      cause: existingAccountsError,
    })
  }

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
      const name = `${prefix}${slug(fullname)}`
      const { body, error } = await management.accounts.create({
        name,
        fullname,
        environment: 'test',
      })

      if (error) {
        throw new Error(`Unable to create account: ${name}`, { cause: error })
      }

      const { account } = body.result
      console.log(`- ${account.fullname} (${account.id})`)
    }
  }
}
