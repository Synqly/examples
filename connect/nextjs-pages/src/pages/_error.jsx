import { Callout, Section, Text, Flex, Code } from '@radix-ui/themes'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

export { ErrorPage as default }

/** @param {ReturnType<typeof ErrorPage.getInitialProps>} props */
function ErrorPage({ statusCode, message }) {
  return (
    <Section maxWidth="var(--container-1)" asChild>
      <Flex gap="4" direction="column">
        <Callout.Root color="red" size="3" mb="6">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text weight={'bold'}>{statusCode}</Callout.Text>
          <Callout.Text>{message}</Callout.Text>
        </Callout.Root>

        <Text as="p">
          This can happen if the <Code>SYNQLY_ORG_TOKEN</Code> environment
          variable is not set to a Synqly Organization access token.
        </Text>
        <Text as="p">
          Please consult <Code>README.md</Code> for more detail on how to set up
          this demo.
        </Text>
      </Flex>
    </Section>
  )
}

/**
 * @param {{
 *   res: import('next').NextPageContext['res']
 *   err: import('next').NextPageContext['err'] & {
 *     content?: import('@synqly/client-sdk').Management.ErrorBody
 *   }
 * }} context
 */
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = err?.statusCode ?? res?.statusCode ?? 500
  const message =
    err?.content?.message ??
    err?.message ??
    res?.statusMessage ??
    statusCode === 404
      ? 'Not found'
      : 'Unknown error'

  return {
    statusCode,
    message,
  }
}
