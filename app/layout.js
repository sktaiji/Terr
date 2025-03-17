import '../styles/globals.css';
import BottomNavigation from '../components/BottomNavigation';

export const metadata = {
  title: '봉사활동 웹사이트',
  description: '봉사활동 정보 제공, 신청, 모임 관리, 공지사항 등을 제공하는 웹사이트입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-gray-100 pb-20">
          {children}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
} 