// ▼▼▼ 修改了這一行，加上了 type 關鍵字 ▼▼▼
import type { ReactNode } from 'react';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

import { BottomNav } from './BottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
}

export const MobileLayout = ({ children, title }: MobileLayoutProps) => {
  const location = useLocation();
  // 如果現在就在設定頁，就不顯示齒輪，以免重複點擊
  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="bg-[#F7F4EB] min-h-screen font-sans text-gray-800">
      {/* 固定頂部標題列 */}
      <header className="fixed top-0 left-0 right-0 bg-[#F7F4EB]/90 backdrop-blur-md z-20 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h1>
        
        {/* 右上角齒輪按鈕 */}
        {!isSettingsPage && (
          <Link to="/settings" className="w-10 h-10 rounded-full bg-white text-gray-400 shadow-sm flex items-center justify-center hover:text-[#5C4033] hover:scale-110 transition-all">
            <FontAwesomeIcon icon={faGear} />
          </Link>
        )}
      </header>

      {/* 內容區域 */}
      <main className="pt-20">
        {children}
      </main>

      {/* 底部導航 */}
      <BottomNav />
    </div>
  );
};