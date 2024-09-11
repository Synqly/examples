import { Header, Main } from '@/components/skeleton'
import { Loader } from '@/components/loader'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Inset,
  Text,
} from '@radix-ui/themes'
import { useIntegrationPoint } from '@synqly/connect-react-sdk'
import { useCallback, useState } from 'react'

export { IntegrationCard }

function IntegrationCard({
  integrationPointName,
  account,
  token,
  title,
  provider = null,
  children: description,
}) {
  // The `useIntegrationPoint` hook is used to get data about an integration
  // point. If `account` is specified, the returned `integrations` list
  // will include the integration associated with that account only.
  const integrationPoint = useIntegrationPoint(integrationPointName, token, {
    account,
    provider,
    onClose: (data) => {
      console.log('onClose', data)
      setSynqlyFrame(null)
    },
    onError: (error) => console.error('onError', error),
    onComplete: (result) => console.log('onComplete', result),
    onDelete: (removed) => console.log('onDelete', removed),
  })

  const [integration] = integrationPoint.integrations
  const [synqlyFrame, setSynqlyFrame] = useState(null)

  return (
    <Card variant="classic" size="4" style={{ width: '565px' }}>
      <Flex gap="6" direction="column">
        <IntegrationHeading title={title}>{description}</IntegrationHeading>

        <Flex justify="between">
          <IntegrationStatus {...integrationPoint} />

          {!!integration ? (
            // If we have integration data, this means an integration has
            // been configured for this integration point so instead of
            // connect we show a button to disconnect the integration.
            <DisconnectButton {...integrationPoint}>
              Disconnect
            </DisconnectButton>
          ) : (
            // When we don't have an integration data, we show a connect
            // button instead. This will call `integrationPoint.connect`
            // with properties that state we plan to embed Connect UI. This
            // returns an iframe, which we then use to set state which
            // opens the frame in a modal dialog.
            <ConnectButton {...integrationPoint} onOpen={setSynqlyFrame}>
              Connect
            </ConnectButton>
          )}
        </Flex>
      </Flex>

      {/* When `synqlyFrame` has been set by the `ConnectButton`, we show
      the contents in a modal dialog. */}
      <Dialog.Root open={!!synqlyFrame}>
        <Dialog.Content style={{ '--max-width': '460px' }}>
          <Inset>{synqlyFrame}</Inset>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  )
}

function IntegrationHeading({ title, children: description }) {
  return (
    <Flex gap="4" direction="column">
      <Flex justify="between" align="center">
        <Heading>{title}</Heading>
        <Text>Powered by Synqly</Text>
      </Flex>
      {description && <Text>{description}</Text>}
    </Flex>
  )
}

function IntegrationStatus(integrationPoint) {
  const {
    integrations: [integration],
    isLoading,
    isValidating,
  } = integrationPoint

  return (
    <Flex gap="2">
      <Text>
        {integration
          ? `${integration.providerFullname} integration added`
          : isLoading || 'No integration'}
      </Text>
      {isValidating && <Loader />}
    </Flex>
  )
}

function ConnectButton({ children, ...integrationPoint }) {
  const { connect, onOpen } = integrationPoint
  const openSynqly = useCallback(() => {
    const connectUI = connect({
      type: 'embedded',
      loader: <Loader />,
    })

    onOpen(connectUI)
  }, [onOpen, connect])

  return <Button onClick={openSynqly}>{children}</Button>
}

function DisconnectButton({ children, ...integrationPoint }) {
  const {
    integrations: [integration],
    disconnect,
  } = integrationPoint

  return (
    <ConfirmDialog
      title={`Disconnect ${integration.fullname}`}
      description="Are you sure? This integration will no longer be accessible."
      action="Disconnect"
      onConfirm={() => disconnect()}
    >
      <Button color="red">{children}</Button>
    </ConfirmDialog>
  )
}
