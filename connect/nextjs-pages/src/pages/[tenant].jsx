'use client'
import { Header, Main } from '@/components/skeleton'
import { Heading } from '@radix-ui/themes'
import { ManagementClient } from '@synqly/client-sdk'
import { IntegrationCard } from '@/components/integration-card'

export { Page as default, getServerSideProps }

/** @param {import('next').GetServerSidePropsContext} context */
async function getServerSideProps(context) {
  const token = process.env.SYNQLY_ORG_TOKEN
  const client = new ManagementClient({
    token,
    environment: process.env.NEXT_PUBLIC_SYNQLY_API_ROOT,
  })

  const { tenant } = context.query
  const { body: account } = await client.accounts.get(
    `${process.env.DEMO_PREFIX}${tenant}`,
  )

  if (!account) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      token,
      account: serialize(account.result),
    },
  }
}

function Page({ token, account, integrationPoints }) {
  return (
    <>
      <Header />
      <Main>
        <Heading>{account.fullname}</Heading>
        <IntegrationCard
          integrationPointName={process.env.NEXT_PUBLIC_AUDIT_LOG_EXPORT_ID}
          title="Audit Log Export"
          account={account}
          token={token}
        >
          Audit Logs are retained for 24 hours. Add an integration to store them
          longer.
        </IntegrationCard>
        <IntegrationCard
          integrationPointName={process.env.NEXT_PUBLIC_SLACK_NOTIFICATIONS_ID}
          title="Slack Notifications"
          account={account}
          token={token}
          provider="slack"
        >
          Some description of the notifications integration point here.
        </IntegrationCard>
      </Main>
    </>
  )
}

function serialize(obj) {
  return obj != null ? JSON.parse(JSON.stringify(obj)) : null
}
