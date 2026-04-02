import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'SmartGarden - Platform IoT Pertanian',
  description: 'Pantau dan kendalikan kebun Anda dari mana saja.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
