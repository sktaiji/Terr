import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '오늘의 봉사',
  description: '봉사활동 정보 제공, 봉사자 모집 및 관리, 봉사활동 일정 관리 시스템',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 