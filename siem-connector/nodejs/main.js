import { config } from 'dotenv'
import { EngineClient, ManagementClient } from '@synqly/client-sdk'

config({ path: ['.env.local'] })

const {
  // SYNQLY_ORG_TOKEN: A Synqly Organization Token, used to create
  // Accounts and Integrations
  SYNQLY_ORG_TOKEN,
  // DURATION_SECONDS: (Optional) Limits the running time of this demo to the given number of seconds. Defaults to 30 seconds.
  DURATION_SECONDS = 30,
  SYNQLY_MANAGEMENT_URL,
  SYNQLY_ENGINE_URL,
} = process.env

if (!SYNQLY_ORG_TOKEN) {
  throw new Error('Must set following environment variable: SYNQLY_ORG_TOKEN')
}

const client = new ManagementClient({
  token: SYNQLY_ORG_TOKEN,
  environment: SYNQLY_MANAGEMENT_URL,
})

main().finally(cleanupDemo) // Start the demo

async function main() {
  // Clean up any previous demo runs and handle Ctrl+C
  await cleanupDemo()
  const controller = new AbortController()
  process.on('SIGINT', async () => {
    console.log(' Interrupted, cleaning up ... ')
    controller.abort('SIGINT')
  })

  // Create our app
  const app = new App(client)

  // Create and configure Demo Tenant 1 to use Splunk SIEM provider
  // (if available, uses the Mock SIEM provider otherwise)
  console.log('Creating Demo Tenant 1')
  const tenant1 = await app.newTenant('Demo Tenant 1')
  await tenant1.configureEventLogging('splunk')

  // Create and configure Demo Tenant 2 to use the Mock SIEM provider
  console.log('Creating Demo Tenant 2')
  const tenant2 = await app.newTenant('Demo Tenant 2')
  await tenant2.configureEventLogging('mock')

  // Create a long running task that generates events
  await app.backgroundJob(DURATION_SECONDS, controller.signal)
}

/**
 * App represents your application. We are not going to implement any app
 * functionality; instead, merely keep a list of tenants, where a tenant
 * represents an end user of your product.
 */
class App {
  /** @type {ManagementClient} */
  #client

  /** @type {Tenant[]} */
  #tenants

  /** @param {ManagementClient} client */
  constructor(client) {
    this.#client = client
    this.#tenants = []
  }

  async syncTenants() {
    const { body: accounts, error } = await this.#client.accounts.list()

    if (error) {
      throw new Error('unable to get accounts', { cause: error })
    }

    // Synchronize app tenant list with Synqly results
    this.#tenants = accounts.result.map(
      (account) => new Tenant(this.#client, account.fullname, account),
    )

    return this.#tenants
  }

  /** @param {string} id */
  async newTenant(id) {
    // Create a Synqly Account for this tenant
    const { body, error } = await this.#client.accounts.create({
      fullname: id,
    })

    if (error) {
      throw new Error('unable to create account', { cause: error })
    }

    // Store the Tenant and associated Synqly objects in an in-memory cache.
    const tenant = new Tenant(
      this.#client,
      body.result.account.fullname,
      body.result.account,
    )
    this.#tenants.push(tenant)
    return tenant
  }

  /**
   * Print a message for every Tenant tenant at regular intervals.
   *
   * This function simulates a background job that runs every second and for
   * every Tenant logs a message if the Tenant's event logger is configured.
   *
   * Note that the PostEvent() call is not specific to Splunk. The code would be
   * the same for any supported Event Provider. This is where Synqly's
   * abstraction kicks in, Integrations within a given Connector category (in
   * this case, Events) share a unified API for data operations, no matter which
   * Provider they target.
   */
  async backgroundJob(durationSeconds, signal) {
    if (signal.aborted) {
      // Just return if we were aborted before getting this far
      return
    }

    const endTime = Date.now() + durationSeconds * 1000

    while (Date.now() < endTime && !signal.aborted) {
      for (const tenant of this.#tenants) {
        if (!tenant.eventLogging) {
          console.log('Skipping tenant, no event logging configured', tenant.id)
          continue
        }

        console.log('Doing some work for tenant', tenant.id)
        const response = await tenant.eventLogging.postEvents([
          createSampleEvent(),
        ])

        if (response.ok) {
          console.log('Logged event for tenant', tenant.id)
        } else {
          console.log(
            'Error logging event for tenant',
            tenant.id,
            response?.error,
          )
        }
      }

      await sleep(1)
    }

    console.log('Done generating events')
  }
}

/**
 * A Tenant object represents one of your customers, as well as the state you
 * would maintain for them in your application.
 */
class Tenant {
  /** @type {ManagementClient} */
  #client

  /** @type {string} */
  #id

  /** @type {import('@synqly/client-sdk/dist/management/api').Account} */
  #synqlyAccount

  /** @type {import('@synqly/client-sdk/dist/engine/api/resources/siem/client/Client').Siem} */
  #eventLogging

  /**
   * @param {string} id
   * @param {string} synqlyAccount
   * @param {ManagementClient} client
   */
  constructor(client, id, synqlyAccount) {
    this.#client = client
    this.#id = id
    this.#synqlyAccount = synqlyAccount
  }

  /** Gets the id of this tenant. */
  get id() {
    return this.#id
  }

  /**
   * Gets the private event logging client.
   *
   * @see configureEventLogging
   */
  get eventLogging() {
    return this.#eventLogging
  }

  /**
   * Initializes event logging for this Tenant.
   *
   * This example uses Splunk as the provider if SPLUNK_TOKEN and
   * SPLUNK_HEC_TOKEN are set, and otherwise uses a mock SIEM provider. However,
   * an Integration can be configured to target any supported provider type.
   *
   * Returns an error if the Tenant cannot be found, or if an Integration cannot
   * be created for the given Tenant.
   *
   * @param {'splunk' | 'mock'} type
   */
  async configureEventLogging(type) {
    /**
     * @type {import('@synqly/client-sdk/dist/management/api').SiemSplunk
     *   | import('@synqly/client-sdk/dist/management/api').SiemMock}
     */
    let providerConfig

    const { SPLUNK_URL, SPLUNK_HEC_TOKEN } = process.env
    if (type === 'splunk' && SPLUNK_URL && SPLUNK_HEC_TOKEN) {
      providerConfig = {
        type: 'siem_splunk',
        hecUrl: SPLUNK_URL,
        hecCredential: {
          type: 'token',
          secret: SPLUNK_HEC_TOKEN,
        },
        skipTlsVerify: false,
      }
    } else {
      if (type === 'splunk') {
        console.warn(
          'Invalid Splunk credentials provided (SPLUNK_URL, SPLUNK_HEC_TOKEN)',
          '\nUsing Mock as the SIEM provider',
        )
      }

      providerConfig = {
        type: 'siem_mock_siem',
      }
    }

    const { body: connector, error } = await this.#client.integrations.create(
      this.#synqlyAccount.id,
      {
        fullname: 'Event Logging',
        providerConfig,
      },
    )

    if (error) {
      throw error
    }

    const { siem } = new EngineClient({
      token: connector.result.token.access.secret,
      environment: SYNQLY_ENGINE_URL,
    })

    this.#eventLogging = siem
    return this.#eventLogging
  }
}

async function cleanupDemo() {
  const { body: accounts } = await client.accounts.list({
    filter: 'name[like]demo-tenant-%',
  })

  if (accounts.result?.length) {
    await Promise.all(
      accounts.result.map(async (account) => {
        const { ok, error } = await client.accounts.delete(account.id)

        if (ok) {
          console.log('Removed demo account', account.fullname)
        } else {
          console.error(
            'Unable to remove demo account',
            account.fullname,
            error,
          )
        }
      }),
    )
  }
}

/** @returns {import('@synqly/client-sdk/dist/engine/api/resources/events/types').Event} */
function createSampleEvent() {
  return {
    className: 'Scheduled Job Activity',
    categoryUid: 1,
    classUid: 1006,
    cloud: {
      provider: 'MS Azure',
    },
    actionId: 1,
    activityId: 2,
    device: {
      typeId: 1,
    },
    job: {
      file: {
        name: 'main.go',
        typeId: 1,
      },
      name: 'Background Job',
    },
    metadata: {
      product: {
        vendorName: 'Synqly SDK for JavaScript/TypeScript',
      },
      version: '1.0.0',
    },
    time: Date.now(),
    severityId: 1,
    typeUid: 100602,
  }
}

function sleep(durationSeconds) {
  return new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000))
}
