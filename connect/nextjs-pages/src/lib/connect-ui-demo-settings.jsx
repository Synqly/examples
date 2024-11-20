import { createContext, useCallback, useContext, useState } from 'react'
import {
  Box,
  Separator,
  Popover,
  Button,
  Flex,
  Heading,
  SegmentedControl,
  Container,
  Theme,
  Text,
  Switch,
} from '@radix-ui/themes'
import { TrashIcon, GearIcon, ReloadIcon } from '@radix-ui/react-icons'
import { ConnectAppearance, ConnectType } from '@synqly/connect-react-sdk'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'

export { ConnectUIDemoContainer, useConnectUIDemoSettings }

const DefaultSettings =
  /** @type {import('@synqly/connect-react-sdk').ConnectOptions} */ ({
    type: ConnectType.EMBEDDED,
    appearance: ConnectAppearance.AUTO,
    experimental_features: undefined,
  })

const DemoSettingsContext = createContext(DefaultSettings)

function useConnectUIDemoSettings() {
  const settings = useContext(DemoSettingsContext)
  return settings
}

/**
 * @param {import('react').PropsWithChildren<
 *   import('@synqly/connect-react-sdk').ConnectTypeOptions
 * >} options
 */
function ConnectUIDemoSettings({ children, ...options }) {
  return (
    <DemoSettingsContext.Provider value={options}>
      {children}
    </DemoSettingsContext.Provider>
  )
}

/** @param {import('react').PropsWithChildren} props */
function ConnectUIDemoContainer({ children }) {
  const [demoSettings, setDemoSettings] = useState(DefaultSettings)
  const forcedTheme =
    demoSettings.appearance === ConnectAppearance.AUTO
      ? undefined
      : demoSettings.appearance

  return (
    <ThemeProvider attribute="class" forcedTheme={forcedTheme}>
      <Theme>
        <Popover.Root>
          <Flex direction="column" gap="4" mt="6">
            <Container>
              <Skeleton width="100px" height="36px" />
            </Container>
            <Separator size="4" />
            <Container>
              <Flex gap="6" align="center">
                <Skeleton variant="active" />
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />

                <Popover.Trigger style={{ marginLeft: 'auto' }}>
                  <Button variant="ghost" color="gray" size="1">
                    Demo settings <GearIcon />
                  </Button>
                </Popover.Trigger>
              </Flex>
            </Container>
            <Separator size="4" />
          </Flex>
          <Popover.Content maxWidth="min-content">
            <Flex direction="column" gap="4">
              <Text size="1" as="p">
                These options allow you to control aspects of this demo and the
                Connect UI experience.
              </Text>

              <Flex gap="4" direction="column">
                <Heading size="1">Type:</Heading>
                <SegmentedControl.Root
                  size="1"
                  defaultValue={demoSettings.type}
                  onValueChange={(type) =>
                    setDemoSettings({ ...demoSettings, type })
                  }
                >
                  <SegmentedControl.Item value={ConnectType.EMBEDDED}>
                    Embedded
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value={ConnectType.POPUP}>
                    Popup
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value={ConnectType.TAB}>
                    Tab
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              </Flex>

              <Flex gap="4" direction="column">
                <Heading size="1">Appearance:</Heading>
                <SegmentedControl.Root
                  size="1"
                  defaultValue={demoSettings.appearance}
                  onValueChange={(appearance) =>
                    setDemoSettings({ ...demoSettings, appearance })
                  }
                >
                  <SegmentedControl.Item value={ConnectAppearance.AUTO}>
                    Auto
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value={ConnectAppearance.LIGHT}>
                    Light
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value={ConnectAppearance.DARK}>
                    Dark
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              </Flex>

              {demoSettings.type === ConnectType.EMBEDDED && (
                <Flex gap="4" direction="column">
                  <Heading size="1">Experimental features:</Heading>
                  <Flex gap="2" align="center" justify="between">
                    <Text size="1">Frame padding</Text>
                    <SegmentedControl.Root
                      size="1"
                      defaultValue={String(
                        demoSettings.experimental_features?.inset ?? false,
                      )}
                      onValueChange={(inset) =>
                        setDemoSettings({
                          ...demoSettings,
                          experimental_features: {
                            ...demoSettings.experimental_features,
                            inset: inset === 'true',
                          },
                        })
                      }
                    >
                      <SegmentedControl.Item value="false">
                        Standard
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="true">
                        Inset
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Flex>

                  <Flex gap="2" align="center" justify="between">
                    <Text size="1">Close button</Text>
                    <SegmentedControl.Root
                      size="1"
                      defaultValue={String(
                        demoSettings.experimental_features?.closeButton ?? true,
                      )}
                      onValueChange={(closeButton) =>
                        setDemoSettings({
                          ...demoSettings,
                          experimental_features: {
                            ...demoSettings.experimental_features,
                            closeButton: closeButton === 'true',
                          },
                        })
                      }
                    >
                      <SegmentedControl.Item value="true">
                        On
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="false">
                        Off
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Flex>

                  <Flex gap="2" align="center" justify="between">
                    <Text size="1">Back button</Text>
                    <SegmentedControl.Root
                      size="1"
                      defaultValue={String(
                        demoSettings.experimental_features?.backButton ?? true,
                      )}
                      onValueChange={(backButton) =>
                        setDemoSettings({
                          ...demoSettings,
                          experimental_features: {
                            ...demoSettings.experimental_features,
                            backButton: backButton === 'true',
                          },
                        })
                      }
                    >
                      <SegmentedControl.Item value="true">
                        On
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="false">
                        Off
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Flex>

                  <Flex gap="2" align="center" justify="between">
                    <Text size="1">Header title</Text>
                    <SegmentedControl.Root
                      size="1"
                      defaultValue={String(
                        demoSettings.experimental_features?.headerTitle ?? true,
                      )}
                      onValueChange={(headerTitle) =>
                        setDemoSettings({
                          ...demoSettings,
                          experimental_features: {
                            ...demoSettings.experimental_features,
                            headerTitle: headerTitle === 'true',
                          },
                        })
                      }
                    >
                      <SegmentedControl.Item value="true">
                        On
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="false">
                        Off
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Flex>
                </Flex>
              )}

              <Flex gap="4" direction="column">
                <Heading size="1">Demo data:</Heading>
                <Flex gap="2" justify="between">
                  <ActionButton href="/api/generate-demo-data">
                    Generate
                  </ActionButton>
                  <ActionButton href="/api/clean-demo-data" color="red">
                    <TrashIcon /> Clean up
                  </ActionButton>
                  <ActionButton href="/api/reset-demo-data" color="red">
                    <ReloadIcon /> Reset
                  </ActionButton>
                </Flex>
              </Flex>
            </Flex>
          </Popover.Content>
        </Popover.Root>

        <ConnectUIDemoSettings {...demoSettings}>
          <Container>{children}</Container>
        </ConnectUIDemoSettings>
      </Theme>
    </ThemeProvider>
  )
}

function Skeleton({
  variant = 'normal',
  width = 'var(--space-8)',
  height = 'var(--space-4)',
}) {
  return (
    <Box
      style={{
        background: variant === 'active' ? 'var(--gray-10)' : 'var(--gray-8)',
        width,
        height,
      }}
    />
  )
}

/**
 * @param {import('react').PropsWithChildren<
 *   {
 *     href: string
 *   } & import('@radix-ui/themes').ButtonProps
 * >} props
 */
function ActionButton({ href, children, ...props }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAction = useCallback(async () => {
    setIsLoading(true)

    const res = await fetch(href)

    if (res.ok) {
      await router.replace('/')
    }

    setIsLoading(false)
  }, [href, router])

  return (
    <Button {...props} loading={isLoading} size="1" onClick={handleAction}>
      {children}
    </Button>
  )
}
