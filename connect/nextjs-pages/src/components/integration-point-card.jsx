import { Loader } from '@/components/loader'
import { Heading, Card, Dialog, Flex, Inset, Text } from '@radix-ui/themes'
import { useIntegrationPoint } from '@synqly/connect-react-sdk'
import { useState } from 'react'
import { DisconnectButton } from './disconnect-button'
import { ConnectButton } from './connect-button'

export { IntegrationPointCard }

/**
 * @param {{
 *   children: Parameters<typeof useIntegrationPoint>[0]
 *   token: Parameters<typeof useIntegrationPoint>[1]
 *   account: import('@synqly/connect-react-sdk').UseIntegrationPointOptions['account']
 * }} props
 */
function IntegrationPointCard({
  children: integrationPointOrId,
  token,
  account,
}) {
  /**
   * The `useIntegrationPoint` hook is used to get data about an integration
   * point. If `account` is also specified, the returned `integrations` list
   * will include the integration associated with that account only.
   *
   * If you provide the full details of an integration point as the first
   * parameter to the hook, it will be used as fallback data that's immediately
   * returned by the hook while it revalidates it against the server in the
   * background. This can be useful to improve perceived performance.
   */
  const integrationPoint = useIntegrationPoint(integrationPointOrId, token, {
    account,

    /**
     * These events represent the lifecycle of a Connect UI process. With the
     * exception of `onDelete`, handlers can be specified at the hook level, or
     * directly when calling the `connect` function.
     */
    onComplete: (event) => console.log('onComplete', event),
    onDelete: (event) => console.log('onDelete', event),
    onError: (event) => console.error('onError', event),
    onClose: (event) => console.log('onClose', event),
  })

  return (
    <Card
      variant="classic"
      size="3"
      style={{ flex: '1', minWidth: 'min-content' }}
    >
      <Flex gap="6" direction="column">
        <IntegrationPointHeader {...integrationPoint} />

        <Flex justify="between" align="center">
          <ConnectionStatus {...integrationPoint} />
          <ConnectionControls {...integrationPoint} />
        </Flex>
      </Flex>
    </Card>
  )
}

/**
 * Renders the Integration Point name and description as a header, used in the
 * IntegrationPointCard component.
 *
 * @param {import('@synqly/connect-react-sdk').UseIntegrationPointData} integrationPoint
 */
function IntegrationPointHeader(integrationPoint) {
  const { result: { fullname, description } = {} } = integrationPoint

  return (
    <Flex gap="4" direction="column">
      <Flex justify="between" align="start" direction="column">
        <Heading size="4">{fullname}</Heading>
        <Text size="2" color="gray">
          Powered by Synqly
        </Text>
      </Flex>
      <Text size="2" style={{ minWidth: '35ch', maxWidth: '55ch' }}>
        {description}
      </Text>
    </Flex>
  )
}

/**
 * Simple component to render whether an integration point has any integrations
 * configured.
 *
 * @param {import('@synqly/connect-react-sdk').UseIntegrationPointData} integrationPoint
 */
function ConnectionStatus(integrationPoint) {
  const { integrations = [], isLoading, isValidating } = integrationPoint
  const integrationCount = integrations.length
  const [first] = integrations

  return (
    <Flex gap="2" align="center">
      {isLoading && <Text size="2">Loading ...</Text>}
      {!isLoading && (
        <Text size="2">
          {integrationCount === 0 && `No integration configured`}
          {integrationCount === 1 && `Using ${first.providerFullname}`}
          {integrationCount > 1 && `Using ${integrations.length} integrations`}
        </Text>
      )}
      <Loader delay visible={isLoading || isValidating} />
    </Flex>
  )
}

/**
 * This component takes care of displaying the connect or disconnect button,
 * depending on whether there are any integrations configured for the
 * integration point.
 *
 * The actual logic to connect or disconnect integrations are abstracted away
 * into the ConnectButton and DisconnectButton components. This is by no means a
 * requirement, you are free to structure your components and UI as best fits
 * your application.
 *
 * @param {import('react').PropsWithChildren<
 *   import('@synqly/connect-react-sdk').UseIntegrationPointData
 * >} props
 */
function ConnectionControls({ children, ...integrationPoint }) {
  /**
   * We use this state to store the Synqly frame when using the embedded mode of
   * Connect UI.
   */
  const [synqlyFrame, setSynqlyFrame] = useState(
    /** @type {import('react').ReactNode} */ (null),
  )

  const hasIntegrations = Number(integrationPoint.integrations?.length) > 0
  const noIntegrations = !hasIntegrations

  return (
    <>
      {/**
       * When we don't have an integration configured, we show a connect button. This
       * will call `integrationPoint.connect` with properties that state we plan to
       * embed Connect UI. This returns an iframe, which we then use to set the state
       * that opens the frame in a modal dialog.
       *
       * Try changing the `appearance` parameter to `dark`. This will force Connect UI
       * to render a dark mode, as opposed to the default `light` that we use in this
       * demo. You can also try removing the `appearance` prop altogether. This will
       * make Connect switch between dark and light mode depending on user
       * preferences.
       *
       * For more details on how it works switching between tabbed and embedded modes,
       * see `connect-button.jsx`.
       */}
      {noIntegrations && (
        <ConnectButton
          onEmbed={(frame) => setSynqlyFrame(frame)}
          onClose={() => setSynqlyFrame(null)}
          {...integrationPoint}
        >
          Connect
        </ConnectButton>
      )}

      {/**
       * If an integration has been configured for this integration point we show a
       * button to disconnect the integration. This demo is designed to only work with
       * a single integration at a time, but Synqly allows multiple integrations to be
       * configured per integration point. See if you can expirement with this demo to
       * display a disconnect button for each integration in the system.
       */}
      {hasIntegrations && (
        <DisconnectButton {...integrationPoint}>Disconnect</DisconnectButton>
      )}

      {/**
       * When using the `embedded` connect type, we open a modal dialog with Connect
       * embedded inside of it.
       */}
      <Dialog.Root open={!!synqlyFrame}>
        <Dialog.Content style={{ maxWidth: '460px' }}>
          <Inset>{synqlyFrame}</Inset>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
