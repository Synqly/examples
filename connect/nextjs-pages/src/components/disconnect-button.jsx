import { Button, AlertDialog, Flex, Inset } from '@radix-ui/themes'
import { IntegrationList } from './integration-list'

export { DisconnectButton }

/**
 * This component disconnects the given integration from the account,
 * effectively removing all data about the integration. In this demo this is
 * implemented using a modal alert dialog.
 *
 * @param {{
 *   children: import('react').ReactNode
 * } & import('@synqly/connect-react-sdk').UseIntegrationPointData} props
 */
function DisconnectButton({ children = 'Disconnect', ...integrationPoint }) {
  const { integrations = [], disconnect } = integrationPoint
  const [first] = integrations
  const fullname =
    integrations.length > 1
      ? `${integrations.length} integrations`
      : first?.fullname ?? ''

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button color="red">{children}</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>Disconnect {fullname}</AlertDialog.Title>
        <Flex gap="6" direction="column">
          <AlertDialog.Description>
            Are you sure you want to disconnect {fullname}? This action is
            permanent and cannot be undone.
          </AlertDialog.Description>

          <Inset my="6">
            <IntegrationList {...integrationPoint} />
          </Inset>

          <Flex gap="3" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={() =>
                  integrations.map((integration) => disconnect?.(integration))
                }
              >
                Disconnect
              </Button>
            </AlertDialog.Action>
          </Flex>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
