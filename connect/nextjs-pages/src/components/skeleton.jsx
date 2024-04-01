import { Heading } from '@radix-ui/themes'
import styles from './skeleton.module.css'

export { Header, Main }

function Header(props) {
  return (
    <header className={styles.header} {...props}>
      <div className={styles.logo} />

      <div className={styles.menu}>
        <div className={styles.menuItemActive} />
        <div className={styles.menuItem} />
        <div className={styles.menuItem} />
        <div className={styles.menuItem} />
        <div className={styles.menuItem} />
      </div>
    </header>
  )
}

function Main({ children, ...props }) {
  return (
    <main className={styles.content} {...props}>
      {children}
    </main>
  )
}
