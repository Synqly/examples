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
  const integrationPoint = useIntegrationPoint(integrationPointName, token, {
    account,
    provider,
    onClose: () => setSynqlyFrame(null),
    onError: (...args) => console.log('onError', ...args),
    onComplete: (...args) => console.log('onComplete', ...args),
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
            <DisconnectButton {...integrationPoint}>
              Disconnect
            </DisconnectButton>
          ) : (
            <ConnectButton onClick={setSynqlyFrame} {...integrationPoint}>
              Connect
            </ConnectButton>
          )}
        </Flex>
      </Flex>

      {/* Synqly Connect Frame embedded in your dialog style */}
      <Dialog.Root open={!!synqlyFrame}>
        <Dialog.Content style={{ width: '460px' }}>
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
      <Text>{description}</Text>
    </Flex>
  )
}

function IntegrationStatus({ integrations, isLoading, isValidating }) {
  const [integration] = integrations

  return (
    <Flex gap="2">
      <Text>
        {integration
          ? `${integration.provider_type} integration added`
          : isLoading || 'No integration'}
      </Text>
      {isValidating && <Loader />}
    </Flex>
  )
}

function ConnectButton({ onClick, children, connect }) {
  const openSynqly = useCallback(() => {
    const connectUI = connect({
      type: 'embedded',
      loader: <Loader />,
    })

    onClick(connectUI)
  }, [onClick, connect])

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
