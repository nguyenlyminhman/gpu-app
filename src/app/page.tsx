"use client";

import Image from "next/image";
import Link from 'next/link';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/welcome-svgrepo-com.svg"
          alt="Welcome Logo"
          width={180}
          height={180}
          priority
        />
        <div className={styles.ctas}>
          <Link
            className={styles.primary}
            href="/gpu"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/gpu-svgrepo-com.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            View demo
          </Link>
        </div>
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
