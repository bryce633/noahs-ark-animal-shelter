import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: "Noah's Ark Animal Shelter | Colby, Kansas",
    template: "%s | Noah's Ark Animal Shelter",
  },
  description:
    "Noah's Ark Animal Shelter is a nonprofit rescuing, rehabilitating, and rehoming dogs and cats in Colby, Kansas. Every Animal Deserves a Safe Haven.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
