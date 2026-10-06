import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'منظومة إصدار وطباعة البطاقات والرخص الرسمية',
  description: 'منظومة متكاملة لإصدار وتخصيص رخص القيادة وهوية مقيم وبطاقات السائقين وطباعتها وتصديرها بدقة عالية.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Tajawal:wght@300;400;500;700;800;900&family=Inter:wght@400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Kufi+Arabic:wght@100..900&family=Noto+Naskh+Arabic:wght@400..700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
