import {
  Heading,
  Callout,
  Flex,
  Link,
  Text,
  Code,
  Section,
} from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { ManagementClient } from '@synqly/client-sdk'
import { serverSideError } from '@/lib/server-error'
import { AccountCard } from '@/components/account-card'
import { AccountsHelp } from '@/lib/help'

export { Page as default, getServerSideProps }

/**
 * When using the NextJS pages router you can export a function called
 * `getServerSideProps` from a page, which will then be run only on the
 * server-side. This means we can use secrets in this demo, such as the
 * `SYNQLY_ORG_TOKEN`, without worry that it will leak to the client side.
 *
 * @type {import('next').GetServerSideProps}
 */
async function getServerSideProps(context) {
  // We start with creating a client to work with the Synqly organization
  // management APIs. Creating a client like this is very cheap and does
  // not do any network calls or other heavy lifting.
  const client = new ManagementClient({
    token: String(process.env.SYNQLY_ORG_TOKEN),
    environment: String(process.env.NEXT_PUBLIC_SYNQLY_API_ROOT),
  })

  // Because this is a demo, we make sure to only list test accounts.
  const accountsList = await client.accounts.list({
    filter: `environment[eq]test`,
  })

  if (accountsList.ok === false) {
    return serverSideError(context, accountsList.error)
  }

  return {
    props: serialize({
      accounts: accountsList.body.result,
    }),
  }
}

/** @param {{ accounts: import('@synqly/client-sdk').Management.Account[] }} props */
function Page({ accounts }) {
  if (accounts.length === 0) {
    return <AccountsHelp />
  }

  return (
    <Section maxWidth="var(--container-1)" asChild>
      <Flex gap="6" direction="column">
        <Heading>Select account</Heading>
        <Flex gap="4" direction="column">
          {accounts.map((account) => (
            <AccountCard key={account.id} {...account} />
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
