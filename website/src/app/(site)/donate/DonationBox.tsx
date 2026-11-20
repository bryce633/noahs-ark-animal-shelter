'use client';

import { useState } from 'react';
import { GIVEBUTTER_URL } from '@/data/site';
import styles from './donate.module.css';

const AMOUNTS = ['$25', '$50', '$100', '$250', '$500', 'Other'];

export default function DonationBox() {
  const [frequency, setFrequency] = useState<'One-time' | 'Monthly'>('One-time');
  const [amount, setAmount] = useState('$100');

  return (
    <div className={`whiteCard ${styles.box}`}>
      <div className={styles.toggle} role="group" aria-label="Donation frequency">
        {(['One-time', 'Monthly'] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.toggleButton} ${frequency === option ? styles.toggleActive : ''}`}
            aria-pressed={frequency === option}
            onClick={() => setFrequency(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className={styles.amounts} role="group" aria-label="Donation amount">
        {AMOUNTS.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.amount} ${amount === option ? styles.amountActive : ''}`}
            aria-pressed={amount === option}
            onClick={() => setAmount(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Givebutter collects the payment; the chosen amount is shown here for the donor. */}
      <a href={GIVEBUTTER_URL} className={`btn btnBrown ${styles.giveButton}`}>
        Donate {amount === 'Other' ? '' : amount} {frequency === 'Monthly' ? 'Monthly ' : ''}with Givebutter
      </a>

      <p className={styles.fineprint}>
        🔒 Secure payments processed by Givebutter. Noah&apos;s Ark Animal Shelter is a 501(c)(3) nonprofit — your gift
        is tax-deductible to the extent allowed by law.
      </p>
    </div>
  );
}
