import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

export { action as default }

const scriptsPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../scripts',
)

/**
 * @type {import('next').NextApiHandler}
 * @returns {Promise<void>}
 */
async function action(req, res) {
  res.setHeader('cache-control', 'no-store')

  const { action } = req.query
  const scripts = []

  if (action === 'reset-demo-data') {
    scripts.push('clean-demo-data.mjs', 'generate-demo-data.mjs')
  } else if (action === 'generate-demo-data' || action === 'clean-demo-data') {
    scripts.push(`${action}.mjs`)
  } else {
    return res.status(404).send({})
  }

  try {
    const output = []

    for (const script of scripts) {
      const lines = execFileSync('node', [`${scriptsPath}/${script}`], {
        encoding: 'utf8',
      }).split('\n')

      output.push(...lines)
    }

    return res.status(200).send({ output })
  } catch ({ output }) {
    return res.status(500).send({ output })
  }
}
