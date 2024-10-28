import styles from './loader.module.css'

export { Loader }

function Loader({ delay = false, visible = true }) {
  const classNames = [
    styles.circular,
    visible && styles.visible,
    delay && styles.delayVisible,
  ].filter(Boolean)

  return (
    <div className={classNames.join(' ')}>
      <div />
      <div />
    </div>
  )
}
