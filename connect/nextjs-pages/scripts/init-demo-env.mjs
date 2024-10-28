export { initEnv }

/**
 * Initializes an environment variable object, using an initial set of values.
 * Sets defaults where needed.
 *
 * @param {object} env
 * @param {string} env.SYNQLY_ORG_TOKEN
 * @param {string} [env.NUM_ACCOUNTS] Number of demo accounts to generate
 *   (default: 3)
 * @param {string} [env.DEMO_PREFIX] Prefix to use for generated demo data
 *   (default: connect-nextjs-pages-demo-)
 * @param {string} [env.NEXT_PUBLIC_SYNQLY_API_ROOT] Root URL of the Synqly API
 *   (default: https://api.synqly.com)
 * @param {string} [env.NEXT_PUBLIC_SYNQLY_CONNECT] Root URL of Synqly Connect
 *   (default: https://connect.synqly.com)
 * @param {string} [env.NEXT_PUBLIC_SYNQLY_MANAGEMENT] Root URL of the Synqly
 *   Management Console (default: https://app.synqly.com)
 * @returns A new object containing validated environment values
 */
function initEnv(env) {
  if (!env || !env.SYNQLY_ORG_TOKEN) {
    throw new Error(`
      SYNQLY_ORG_TOKEN must be set to a Synqly Organization access token for
      this demo to work. Please consult the authentication guide for more
      detail: https://docs.synqly.com/reference/api-authentication
    `)
  }

  const validEnv = {}

  validEnv.SYNQLY_ORG_TOKEN = env.SYNQLY_ORG_TOKEN
  validEnv.NEXT_PUBLIC_SYNQLY_API_ROOT =
    env.NEXT_PUBLIC_SYNQLY_API_ROOT || 'https://api.synqly.com'
  validEnv.NEXT_PUBLIC_SYNQLY_CONNECT =
    env.NEXT_PUBLIC_SYNQLY_CONNECT || 'https://connect.synqly.com'
  validEnv.NEXT_PUBLIC_SYNQLY_MANAGEMENT =
    env.NEXT_PUBLIC_SYNQLY_MANAGEMENT || 'https://app.synqly.com'

  validEnv.DEMO_PREFIX = env.DEMO_PREFIX || 'connect-nextjs-pages-demo'
  validEnv.NUM_ACCOUNTS = Math.max(1, Number(env.NUM_ACCOUNTS) || 3)
  validEnv.AUDIT_LOG_EXPORT_ID = `${validEnv.DEMO_PREFIX}-audit-log-export`
  validEnv.SLACK_NOTIFICATIONS_ID = `${validEnv.DEMO_PREFIX}-slack-notifications`

  return validEnv
}
