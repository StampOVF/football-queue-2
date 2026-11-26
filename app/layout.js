import { Kanit, Sarabun } from 'next/font/google';
import './globals.css';

const head = Kanit({ subsets: ['thai', 'latin'], weight: ['500', '600'], variable: '--font-head' });
const body = Sarabun({ subsets: ['thai', 'latin'], weight: ['400', '600'], variable: '--font-body' });

export const metadata = { title: 'จองคิวสนามฟุตบอล' };

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${head.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
