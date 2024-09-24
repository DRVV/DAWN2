import Link from 'next/link';
import Head from 'next/head';

import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Knowledge Management Console</title>
      </Head>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navLink}>
          Home
        </Link>

        <Link href="/git-history" className={styles.navLink}>
          Version Control
        </Link>

        <Link href="/merged-graph"className={styles.navLink}>
          Merged Graph
        </Link>
        {/* Add more navigation links if needed */}
        
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
