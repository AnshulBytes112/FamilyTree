import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { Trees } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
});

export const metadata: Metadata = {
  title: 'Our Family',
  description: 'Preserve your family story and build your family tree together.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${notoSansDevanagari.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900`}
      >
        <NextIntlClientProvider messages={messages}>
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
                <div className="bg-emerald-600 text-white p-1.5 rounded-md">
                  <Trees size={20} />
                </div>
                <span>Our Family</span>
              </Link>
              <LanguageSwitcher />
            </div>
          </header>
          
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
