import { Heading, Flex, Section, Link } from '@radix-ui/themes'
import { ChevronLeftIcon } from '@radix-ui/react-icons'
import { ManagementClient } from '@synqly/client-sdk'
import { IntegrationPointCard } from '@/components/integration-point-card'
import { serverSideError } from '@/lib/server-error'
import { IntegrationPointsHelp } from '@/lib/help'

export { Page as default, getServerSideProps }

/** @param {import('next').GetServerSidePropsContext} context */
async function getServerSideProps(context) {
  // Using the SYNQLY_ORG_TOKEN on the server side is ok, because it's a
  // trusted environment. However you must never use this in an untrusted
  // environment like a web browser. For that, rely on token exchange to
  // retrieve a more ephemeral and tightly scoped token. An example of
  // this is shown later in this function.
  // ManagementClient should only be used on the server.
  const client = new ManagementClient({
    token: String(process.env.SYNQLY_ORG_TOKEN),
    environment: process.env.NEXT_PUBLIC_SYNQLY_API_ROOT,
  })

  // Typically in a multi-tenant application you'd have some identifier for
  // the tenant in your system. To sync this with an account in Synqly, we
  // recommend that you either store the id of the Synqly account with your
  // tenant details. If you don't wish to store the Synqly account id in
  // your data layer, you can rely on naming conventions instead.
  //
  // This works because nearly all APIs that require you to specify an id,
  // i.e. there's a path parameter called {accountId} or
  // {integrationId}, can use a name in place of the id. That way you can
  // specify a name of your choosing, e.g. `tenant-${yourTenantId}`, and
  // use that for identifying the correct resource.
  //
  // In this demo, because it is stateless we use the `tenant` context
  // parameter to provide us with an account name.
  const { tenant } = context.query

  const accountResponse = await client.accounts.get(String(tenant))
  if (accountResponse.ok === false) {
    return serverSideError(context, accountResponse.error)
  }

  const account = accountResponse.body.result

  // Before we render the page, we need to exchange our SYNQLY_ORG_TOKEN for
  // a more ephemeral and tightly scoped access token. You must never use
  // the SYNQLY_ORG_TOKEN in untrusted environments like a web browser.
  // Instead, always rely on token exchange to create a token more suitable
  // the task at hand.
  //
  // For Connect UI there's a specific permission set called `connect-ui`.
  // This permission set only includes the specific permissions necessary
  // for Connect UI to do its job. This ensures that even though we're
  // using this token in an untrusted environment, it can only be used to
  // connect or disconnect integrations for the specified account.
  //
  // For more information about Synqly tokens, please refer to the docs:
  // https://docs.synqly.com/reference/api-authentication
  const tokenResponse = await client.tokens.createToken({
    permissionSet: 'connect-ui',
    tokenTtl: '24h',
    resources: {
      accounts: {
        ids: [account.id],
      },
    },
  })

  if (tokenResponse.ok === false) {
    return serverSideError(context, tokenResponse.error)
  }

  const token = tokenResponse.body.result.primary.access

  const integrationPointsResponse = await client.integrationPoints.list()
  if (integrationPointsResponse.ok === false) {
    return serverSideError(context, integrationPointsResponse.error)
  }
  const integrationPoints = integrationPointsResponse.body.result

  return {
    props: serialize({
      token,
      account,
      integrationPoints,
    }),
  }
}

/**
 * @param {{
 *   token: import('@synqly/client-sdk').Management.Token
 *   account: import('@synqly/client-sdk').Management.Account
 *   integrationPoints: import('@synqly/client-sdk').Management.IntegrationPoint[]
 * }} props
 */
function Page({ token, account, integrationPoints }) {
  if (integrationPoints.length === 0) {
    return <IntegrationPointsHelp />
  }

  return (
    <Section asChild>
      <Flex direction="column" gap="6">
        <Flex align="center" asChild maxWidth="fit-content">
          <Link href="/" size="1">
            <ChevronLeftIcon />
            Back to accounts
          </Link>
        </Flex>

        <Heading>{account.fullname}</Heading>

        <Flex wrap="wrap" gap="4">
          {integrationPoints.map((integrationPoint) => (
            /**
             * The IntegrationPointCard component is an example of how you could
             * abstract the integration point management into components that
             * make sense to your use case and code base.
             *
             * Here we loop over all integration points in the Synqly
             * organization, and render each one as a card.
             */
            <IntegrationPointCard
              key={integrationPoint.id}
              token={token}
              account={account}
            >
              {integrationPoint}
            </IntegrationPointCard>
          ))}
        </Flex>
      </Flex>
    </Section>
  )
}

/** @param {any} obj */
function serialize(obj) {
  return obj != null ? JSON.parse(JSON.stringify(obj)) : null
}
