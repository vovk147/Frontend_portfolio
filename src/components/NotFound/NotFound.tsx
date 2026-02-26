
import React from 'react';
import Link from 'next/link';
import styles from './NotFound.module.scss';

const NotFound: React.FC = () => {
  return (
    <div className={styles.errorWrapper}>
      {/* Генерируем лепестки */}
      <div className={styles.petals}>
        {[...Array(25)].map((_, i) => (
          <div key={i} className={styles.petal} />
        ))}
      </div>

      <main className={styles.codeContainer}>
        <h1 className={styles.code}>404</h1>
        <span className={styles.verticalText}>Page Not Found</span>
      </main>

      <Link href="/" className={styles.backBtn}>
        Back Home
      </Link>
    </div>
  );
};

export default NotFound;