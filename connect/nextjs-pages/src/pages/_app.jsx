import { Theme } from '@radix-ui/themes'
import Head from 'next/head'

import '@/styles/reset.css'
import '@radix-ui/themes/styles.css'
import { SynqlyProvider } from '@synqly/connect-react-sdk'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Synqly - Connect demo</title>
        <meta name="description" content="Synqly Connect product demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/synqly-favicon.png" />
      </Head>
      <SynqlyProvider
        baseURL={process.env.NEXT_PUBLIC_SYNQLY_API_ROOT}
        connectURL={process.env.NEXT_PUBLIC_SYNQLY_CONNECT}
      >
        <Theme>
          <Component {...pageProps} />
        </Theme>
      </SynqlyProvider>
    </>
  )
}
