// @ts-nocheck
export { handleUnexpectedError }

function handleUnexpectedError(
  { message, cause = '', env = {} },
  log = console,
) {
  const { error } = log
  error.call(
    log,
    `
    Something went wrong but don't worry – your organization is safe!

    This likely happened because ${
      env.SYNQLY_ORG_TOKEN
        ? 'SYNQLY_ORG_TOKEN is set to an invalid organization access token.'
        : 'SYNQLY_ORG_TOKEN is not set.'
    }

    Please check your .env.local and consult README.md for more detail on
    how to set up this demo.

    Error: ${message}
    ${cause ? JSON.stringify(cause) : ''}
  `,
  )
}
