#!/usr/bin/env node
import { faker } from '@faker-js/faker'
import { Management, ManagementClient } from '@synqly/client-sdk'
import slug from 'slug'
import { env } from './script-init.mjs'

const managementClient = new ManagementClient({
  token: env.SYNQLY_ORG_TOKEN,
  environment: env.NEXT_PUBLIC_SYNQLY_API_ROOT,
})

console.log('\nEnsuring demo accounts ...')
await ensureAccounts(managementClient, env.NUM_ACCOUNTS)

console.log('\nEnsuring demo integration points ...')
await ensureIntegrationPoints(managementClient)

console.log('\nDone. Run scripts/clean-demo-data.mjs to clean up.')

/** @param {ManagementClient} management */
async function ensureIntegrationPoints(management) {
  const connectors = Object.entries(Management.CategoryId)

  const integrationPointsList = await management.integrationPoints.list({
    filter: `name[in]${connectors.map(
      ([_, connector]) => `${env.DEMO_PREFIX}-${connector}`,
    )}`,
  })

  if (integrationPointsList.ok === false) {
    throw integrationPointsList.error
  }

  const existingPoints = integrationPointsList.body.result

  console.log(`Found ${existingPoints.length} demo integration points`)
  for (const integrationPoint of existingPoints) {
    console.log(`- ${integrationPoint.fullname} (${integrationPoint.name})`)
  }

  if (existingPoints.length < connectors.length) {
    console.log(
      `Creating ${connectors.length - existingPoints.length} new integration points ...`,
    )

    for (const [connectorName, connector] of connectors) {
      const existing = existingPoints.find(
        (point) => point.connector == connector,
      )

      if (!existing) {
        const integrationPoint = await management.integrationPoints.create({
          // The `connector` defines which category of connector this
          // integration point (and any integrations configured for it)
          // will use.
          connector,

          // The name acts as a slug, or human friendly identifier. If not
          // specified, it will have the same value as the automatically
          // generated `id` field.
          name: `${env.DEMO_PREFIX}-${connector}`,

          // The `fullname` of an integration point is used within Connect
          // UI to render the heading of the integration point.
          fullname: `${connectorName} Demo Connector`,

          // We recommend setting a description for your integration points.
          // We don't render this description anywhere in the Connect UI
          // experience, but you may choose to do so in your application
          // UI. In this demo application, it's rendered in the list of
          // integration points.
          description: `This integration point was created by the Synqly ConnectUI demo application to demonstrate the ${connectorName} Connector.`,

          // The `environments` field lets you define allowed provider
          // configurations in specific environments. At least one
          // environment has to be specified. NOTE: if an environment
          // is *not* specified then no providers will be allowed in that
          // environment. The same holds true for an empty array. We
          // recommend using `['*']` unless you have specific reasons to
          // lock this down to a specific set of allowed provider types.
          environments: {
            prod: ['*'],
            test: ['*'],
          },
        })

        if (integrationPoint.ok === false) {
          console.warn(
            'Unable to create integration point:',
            connector,
            integrationPoint.error,
          )
          continue
        }

        const { fullname, id } = integrationPoint.body.result
        console.log(`- ${fullname} (${id})`)
      }
    }
  }
}

/**
 * This function checks to see that the organization has a minimum number of
 * demo accounts set up. Demo accounts are marked with a prefix set by the
 * `DEMO_PREFIX` environment variable, and also belong to the `test`
 * environment.
 *
 * @param {ManagementClient} management
 * @param {number} minCount
 */
async function ensureAccounts(management, minCount) {
  const accountsList = await management.accounts.list({
    filter: [`name[like]~${env.DEMO_PREFIX}-%`, 'environment[eq]test'],
  })

  if (accountsList.ok === false) {
    throw new Error('Unable to list existing accounts.', {
      cause: accountsList.error,
    })
  }

  const existingAccounts = accountsList.body.result

  console.log(`Found ${existingAccounts.length} demo accounts`)
  for (const account of existingAccounts) {
    console.log(`- ${account.fullname} (${account.id}}`)
  }

  const additionalCount = minCount - existingAccounts.length

  if (additionalCount > 0) {
    console.log(`Creating ${additionalCount} new accounts ...`)
    const generatedAccountNames = faker.helpers.uniqueArray(
      faker.company.name,
      additionalCount,
    )

    for (const generatedName of generatedAccountNames) {
      const name = `~${env.DEMO_PREFIX}-${slug(generatedName)}`
      const createdAccount = await management.accounts.create({
        // The name acts as a slug, or human friendly identifier. If not
        // specified, it will have the same value as the automatically
        // generated `id` field.
        name,

        // The `fullname` of an Account is only used for display purposes,
        // both in the demo and in the Synqly management UI.
        fullname: generatedName,

        // Because we're generating demo accounts, we specifically mark them
        // as beloning to the `test` environment, which means they won't
        // show in the production mode of the Synqly API.
        environment: 'test',
      })

      if (createdAccount.ok === false) {
        throw new Error(`Unable to create account: ${name}`, {
          cause: createdAccount.error,
        })
      }

      const { fullname, id } = createdAccount.body.result.account
      console.log(`- ${fullname} (${id})`)
    }
  }
}
