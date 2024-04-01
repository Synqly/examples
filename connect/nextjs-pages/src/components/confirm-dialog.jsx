import {
  AlertDialog,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Inset,
  Text,
} from '@radix-ui/themes'

export { ConfirmDialog }

function ConfirmDialog({
  title,
  description,
  cancel = 'Cancel',
  action = 'Ok',
  onConfirm,
  children,
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{children}</AlertDialog.Trigger>
      <AlertDialog.Content style={{ maxWidth: 450 }}>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">
          {description}
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              {cancel}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={onConfirm}>
              {action}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
