# Connect UI Example – NextJS Pages Router

The Connect UI example demonstrates how to use the Synqly's Connect UI in a multi-tenant Next JS application. It demonstrates how Connect UI is used to allow end-users to configure their integrations, as well as how to retrieve details about the integration.

For more information about Synqly, please see <https://www.synqly.com>.

This example shows you how to:

- Define multiple tenants in a sample application
- Define integration points that are global to the organization
- Integrate Connect UI with a simple NextJS application

> [!TIP]
> Reference documentation for Synqly APIs are available at <https://docs.synqly.com>.

## Prerequisites

- A [Synqly](https://synqly.com) Organization
- Your Synqly Organization Token
- [Node.js](https://nodejs.org/en) v18 or later

## Setup and run the example

1. Clone this repository and navigate to the directory of this example:
   ```sh
   cd connect/nextjs-pages
   ```
2. Rename [.env.template](./.env.template) to `.env.local` and set the variable `SYNQLY_ORG_TOKEN` to the value of your organization access token – you can find this in your [Synqly organization settings](https://app.synqly.com/settings/secrets)
3. Install dependencies
   ```sh
   npm install
   ```
4. Generate the sample data by running [scripts/generate-demo-data.mjs](scripts/generate-demo-data.mjs):
   ```sh
   scripts/generate-demo-data.mjs
   ```
5. Start the demo
   ```sh
   npm run dev
   ```
6. You can now access the demo at <http://localhost:4000>

Exit the example by pressing `Ctrl+C`.

To clean up the sample data that was generated at startup, run [scripts/clean-demo-data.mjs](scripts/clean-demo-data.mjs):

```sh
scripts/clean-demo-data.mjs
```

[Synqly Client SDK]: https://github.com/Synqly/typescript-client-sdk
[Synqly/typescript-client-sdk]: https://github.com/Synqly/typescript-client-sdk
[Synqly Connect React SDK]: https://github.com/Synqly/connect-react-sdk
[Synqly/connect-react-sdk]: https://github.com/Synqly/connect-react-sdk

## Support

If you have questions or need support with this example or Synqly's platform, please don't hesitate to contact us!
