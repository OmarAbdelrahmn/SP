import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CertiCraft Studio - Template & Certificate Personalization Engine',
  description: 'Upload any image template, assign personal data fields, and instantly generate high-resolution personalized certificates, passes, and badges in bulk.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Tajawal:wght@300;400;500;700;800;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
