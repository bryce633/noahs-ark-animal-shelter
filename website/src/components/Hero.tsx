import styles from './Hero.module.css';

type HeroProps = {
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
};

export default function Hero({ title, subtitle, badge, children }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        {badge && <span className="badge">{badge}</span>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </section>
  );
}
