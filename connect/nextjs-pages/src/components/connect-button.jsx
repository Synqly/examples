import { useCallback, useState } from 'react'
import { Loader } from './loader'
import { Button, Flex } from '@radix-ui/themes'
import { ConnectType } from '@synqly/connect-react-sdk'
import { OpenInNewWindowIcon } from '@radix-ui/react-icons'
import { useConnectUIDemoSettings } from '@/lib/connect-ui-demo-settings'

export { ConnectButton }

/**
 * This component switches how we call Connect UI, using either the embedded
 * mode or opening a new tab or popup window. This is done for demo purposes to
 * showcase how easy it is to use either mode, but we recommend you pick
 * whichever mode works best for your application.
 *
 * @param {import('react').PropsWithChildren<{
 *   onEmbed?: (connectUI: import('react').ReactNode) => void
 *   onClose?: import('@synqly/connect-react-sdk').ConnectCallback<
 *     import('@synqly/connect-react-sdk').CloseEvent
 *   >
 * }> &
 *   import('@synqly/connect-react-sdk').UseIntegrationPointData} props
 */
function ConnectButton({
  children = 'Connect',
  onEmbed,
  onClose,
  ...integrationPoint
}) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { type = 'embedded', appearance = 'auto' } = useConnectUIDemoSettings()

  const openConnect = useCallback(() => {
    setIsConnecting(true)

    const connectUI = integrationPoint.connect?.({
      type,
      appearance,
      loader: <Loader />,
      onClose: (event) => {
        setIsConnecting(false)
        onClose?.(event)
      },
    })

    if (type === ConnectType.EMBEDDED) {
      onEmbed?.(connectUI)
    }
  }, [integrationPoint, type, appearance, onClose, onEmbed])

  return (
    <Flex direction="column" gap="4" align={'end'}>
      <Button
        disabled={integrationPoint.isLoading || isConnecting}
        onClick={openConnect}
        loading={isConnecting}
      >
        {children}
        {type !== ConnectType.EMBEDDED && <OpenInNewWindowIcon />}
      </Button>
    </Flex>
  )
}
