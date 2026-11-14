import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ورزشا | زمین، همبازی و مربی',
  description: 'رزرو زمین تنیس و پدل، پیدا کردن همبازی و مربی در ورزشا',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
