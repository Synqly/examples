export { serverSideError }

/**
 * @param {Parameters<import('next').GetServerSideProps>[0]} context
 * @param {{
 *   statusCode?: any
 *   content?: any
 * }} [error]
 */
function serverSideError(context, { statusCode = 500, content } = {}) {
  context.res.statusCode = statusCode
  return {
    props: {
      error: {
        ...content,
        statusCode,
      },
    },
  }
}
