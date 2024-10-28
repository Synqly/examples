import { Table, Text, Tooltip } from '@radix-ui/themes'

export { IntegrationList }

/** @param {import('@synqly/connect-react-sdk').UseIntegrationPointData} integrationPoint */
function IntegrationList(integrationPoint) {
  const { integrations = [] } = integrationPoint

  return (
    <Table.Root size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            <Text size="1" truncate>
              Provider
            </Text>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <Text size="1" truncate>
              Integration ID
            </Text>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <Text size="1" truncate>
              Last Updated
            </Text>
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {integrations.length === 0 && <NoIntegrationsMessage />}
        {integrations.map((integration) => (
          <IntegrationRow key={integration.id} {...integration} />
        ))}
      </Table.Body>
    </Table.Root>
  )
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'short',
})

/** @param {import('@synqly/client-sdk').Management.Integration} integration */
function IntegrationRow(integration) {
  const { id, providerFullname, updatedAt } = integration

  return (
    <Table.Row>
      <Table.RowHeaderCell>
        <Text size="1" truncate>
          {providerFullname}
        </Text>
      </Table.RowHeaderCell>
      <Table.Cell>
        <Text size="1" truncate>
          {id}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Text size="1" truncate>
          {dateFormat.format(new Date(updatedAt))}
        </Text>
      </Table.Cell>
    </Table.Row>
  )
}

function NoIntegrationsMessage() {
  return (
    <Table.Row>
      <Table.RowHeaderCell colSpan={2}>No integrations</Table.RowHeaderCell>
    </Table.Row>
  )
}
