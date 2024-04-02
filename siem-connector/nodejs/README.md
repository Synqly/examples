# SIEM Connector Example

The siem-connector example demonstrates how to use the Synqly's SIEM Connector to send events to a SIEM Provider from within a multi-tenant application.

For more information about Synqly, please see <https://www.synqly.com>.

This example shows you how to:

- Define multiple tenants in a sample application
- Define an Integration for each tenant (using Splunk as the target SIEM Provider if available)
- Run a background job to simulate load for each tenant
- Send events from the background job to Synqly
- Demonstrate that events are sent in OCSF format and transformed by Synqly before being forwarded to the target SIEM Provider

> [!TIP]
> Reference documentation for Synqly APIs are available at <https://docs.synqly.com>.

## Prerequisites

- A [Synqly](https://synqly.com) Organization
- Your Synqly Organization Token

### Optional

Setting up Splunk is optional, but also makes for a more compelling demo of the Synqly Connector APIs.

- A Splunk account – [sign up for a free trial](https://www.splunk.com/en_us/download.html)
- A Splunk HTTP Event Collector (HEC) endpoint and API token – [create a new HEC token](https://docs.splunk.com/Documentation/Splunk/8.1.3/Data/UsetheHTTPEventCollector#Create_an_Event_Collector_token)

## Setup and run the example

> [!IMPORTANT]
> While Synqly is in private beta, the [Synqly Client SDK] and [Synqly Connect React SDK] can only be installed from a private npm packages. To install, make sure you've first logged in to npm:
>
> ```sh
> npm login
> ```
>
> Please contact us if you need access or support.

1. Clone this repository and navigate to the directory of this example:
   ```bash
   cd siem-connector/nodejs
   ```
2. Rename [.env.template](./.env.template) to `.env.local` and set the variable `SYNQLY_ORG_TOKEN` to the value of your organization access token – you can find this in your [Synqly organization settings](https://app.synqly.com/settings/secrets)
3. Install dependencies
   ```bash
   npm install
   ```
4. **(Optional)** Configure access to Splunk via the environment variables `SPLUNK_URL` and `SPLUNK_HEC_TOKEN` – either add them to `.env.local` or export them like so:
   ```sh
   export SPLUNK_URL=https://my-org.splunkcloud.com:8088/services/collector/event
   export SPLUNK_HEC_TOKEN=my-splunk-token
   ```
5. **(Optional)** Set the duration the demo will run by setting the `DURATION_SECONDS` variable in the `.env.local` file
6. Start the demo
   ```bash
   npm start
   ```

Exit the example by pressing `Ctrl+C`, or wait until it completes its run.

If you've configured Splunk you can now view the events that were posted by the demo. In the Splunk UI, navigate to **Search** > **Search & Reporting** and run a search for `sourcetype=httpevent`.

[Synqly Client SDK]: https://github.com/Synqly/typescript-client-sdk
[Synqly/typescript-client-sdk]: https://github.com/Synqly/typescript-client-sdk

## Support

If you have questions or need support with this example or Synqly's platform, please don't hesitate to contact us!
