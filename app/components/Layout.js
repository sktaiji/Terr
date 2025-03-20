'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();
  
  // 메뉴 아이템 정의
  const menuItems = [
    { title: 'Home', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { title: 'Service', path: '/service', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { title: 'Territory', path: '/territory', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { title: 'Admin', path: '/admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <main className="flex-grow pb-16">
        {children}
      </main>
      
      {/* 푸터 네비게이션 - 고정 위치로 유지 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-2 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors
                  ${pathname === item.path 
                    ? 'text-sky-600' 
                    : 'text-gray-500 hover:text-sky-600'
                  }`}
              >
                <svg 
                  className="w-6 h-6 mb-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
} 