import { Section, Callout, Flex, Text, Link, Code } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'

export { AccountsHelp, IntegrationPointsHelp }

function AccountsHelp() {
  return (
    <Section asChild maxWidth="var(--container-1)">
      <Flex gap="4" direction="column">
        <Callout.Root mb="6">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text weight="medium">No Accounts!</Callout.Text>
          <Callout.Text>
            It looks like we were unable to find any test Accounts.
          </Callout.Text>
        </Callout.Root>

        <Text as="p">
          This demo works by listing test Accounts in your Synqly organization.
          In order to proceed with the demo, please create one or more test
          Accounts using the{' '}
          <Link
            target="_blank"
            href="https://docs.synqly.com/reference/accounts_create"
          >
            Management API
          </Link>
          .
        </Text>

        <Text as="p">
          You can also create test Accounts using the{' '}
          <Link
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_SYNQLY_MANAGEMENT}/test/accounts`}
          >
            Management Console
          </Link>{' '}
          by enabling <Code>Test Mode</Code>.
        </Text>

        <SampleDataTip />
      </Flex>
    </Section>
  )
}

function IntegrationPointsHelp() {
  return (
    <HelpSection>
      <Callout.Root size="3">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text weight="medium">No Integration Points!</Callout.Text>
        <Callout.Text>
          It looks like we were unable to find any Integration Points.
        </Callout.Text>
      </Callout.Root>

      <Text as="p">
        This demo works by listing Integration Points in your Synqly
        organization. In order to proceed with the demo, please create one or
        more Integration Points using the{' '}
        <Link
          target="_blank"
          href="https://docs.synqly.com/reference/integration_points_create"
        >
          Management API
        </Link>
        .
      </Text>
      <Text as="p">
        You can also create Integration Points using the{' '}
        <Link
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_SYNQLY_MANAGEMENT}/test/integration-points`}
        >
          Management Console
        </Link>
        .
      </Text>
      <SampleDataTip />
    </HelpSection>
  )
}

function SampleDataTip() {
  return (
    <>
      <Text as="p" size="1" mt="6">
        Psst! You may also generate demo data using the settings menu in the top
        right of this screen. The logic for this data generation is available in
        the <Code>scripts</Code> directory. Please see <Code>README.md</Code>{' '}
        for instructions.
      </Text>
    </>
  )
}

/** @param {import('react').PropsWithChildren} props */
function HelpSection({ children }) {
  return (
    <Section asChild maxWidth="var(--container-1)">
      <Flex gap="4" direction="column">
        {children}
      </Flex>
    </Section>
  )
}
