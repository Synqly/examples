import { Card, Flex, Heading, Tooltip, Badge } from '@radix-ui/themes'

export { AccountCard }

/**
 * This component renders details of a Synqly Account as a card.
 *
 * @param {import('@synqly/client-sdk').Management.Account} account
 */
function AccountCard(account) {
  const { name, fullname, environment } = account

  return (
    <Card variant="classic" size="4" asChild>
      <a href={`/${name}`}>
        <Flex align="center" justify="between">
          <Heading size="4">{fullname}</Heading>
          <Tooltip content={`Synqly ${environment} account`}>
            <Badge>{environment}</Badge>
          </Tooltip>
        </Flex>
      </a>
    </Card>
  )
}
