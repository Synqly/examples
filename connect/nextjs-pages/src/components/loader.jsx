import styles from './loader.module.css'

export { Loader }

function Loader() {
  return (
    <div className={styles.circular}>
      <div />
      <div />
    </div>
  )
}
