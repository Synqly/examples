import Head from 'next/head'
import '@/styles/reset.css'
import '@radix-ui/themes/styles.css'
import { SynqlyProvider } from '@synqly/connect-react-sdk'
import ErrorPage from './_error'
import { ConnectUIDemoContainer } from '@/lib/connect-ui-demo-settings'

export { App as default }

/** @param {import('next/app').AppProps} props */
function App({ Component, pageProps }) {
  const { error } = pageProps

  return (
    <>
      <Head>
        <title>Synqly - Connect demo</title>
        <meta name="description" content="Synqly Connect product demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/synqly-favicon.png" />
      </Head>
      <ConnectUIDemoContainer>
        <SynqlyProvider
          baseURL={process.env.NEXT_PUBLIC_SYNQLY_API_ROOT}
          connectURL={process.env.NEXT_PUBLIC_SYNQLY_CONNECT}
        >
          {error && <ErrorPage {...error} />}
          {!error && <Component {...pageProps} />}
        </SynqlyProvider>
      </ConnectUIDemoContainer>
    </>
  )
}
