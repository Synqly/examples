import { Header, Main } from '@/components/skeleton'
import { Card, Heading, Callout } from '@radix-ui/themes'
import { ManagementClient } from '@synqly/client-sdk'
import Link from 'next/link'

export { Page as default, getServerSideProps }
async function getServerSideProps() {
  const client = new ManagementClient({
    token: process.env.SYNQLY_ORG_TOKEN,
    environment: process.env.NEXT_PUBLIC_SYNQLY_API_ROOT,
  })

  const { body: synqlyAccounts } = await client.accounts.list({
    filter: `name[like]${process.env.DEMO_PREFIX}%`,
  })

  const appAccounts = synqlyAccounts.result.map((account) => ({
    id: account.id,
    name: account.name.replace(process.env.DEMO_PREFIX, ''),
    fullname: account.fullname,
  }))

  return {
    props: {
      accounts: appAccounts,
    },
  }
}

function Page({ accounts }) {
  return (
    <>
      <Header />
      <Main style={{ width: '25rem' }}>
        <Heading>Sign in</Heading>
        {accounts?.map((account) => (
          <Card key={account.id} variant="classic" size="4" asChild>
            <Link href={`/${account.name}`}>
              <Heading>{account.fullname}</Heading>
            </Link>
          </Card>
        ))}
      </Main>
    </>
  )
}

function serialize(obj) {
  return obj != null ? JSON.parse(JSON.stringify(obj)) : null
}
