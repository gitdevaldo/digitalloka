import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DigitalLoka — Dashboard Panel',
  description: 'Manage your droplets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
