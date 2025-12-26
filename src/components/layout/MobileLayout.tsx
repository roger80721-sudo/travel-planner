import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faWifi, faBatteryThreeQuarters, faSignal } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
}

export const MobileLayout = ({ children, title }: MobileLayoutProps) => {
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';

  // 真實時間顯示
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      
      {/* 裝飾用的頂部波浪 (選用) */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-[#8DD2BA] -z-10 rounded-b-[40px] shadow-sm opacity-20" />

      {/* NookPhone 狀態列 */}
      <header className="fixed top-0 left-0 right-0 z-20 px-6 pt-2 pb-4 bg-[#F2F4E7]/90 backdrop-blur-sm rounded-b-3xl shadow-sm border-b-2 border-white">
        
        {/* 第一排：狀態資訊 (Wifi, 時間, 電池) */}
        <div className="flex justify-between items-center text-[#3AA986] text-xs font-bold mb-2 opacity-80">
          <div className="flex items-center space-x-1">
             <span>{formatDate(time)}</span>
          </div>
          <div className="flex items-center space-x-3">
             <FontAwesomeIcon icon={faSignal} />
             <FontAwesomeIcon icon={faWifi} />
             <span>{formatTime(time)}</span>
             <FontAwesomeIcon icon={faBatteryThreeQuarters} className="text-sm" />
          </div>
        </div>

        {/* 第二排：標題與設定 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#5E5340] tracking-wider bg-white/60 px-4 py-1 rounded-full border-2 border-white shadow-sm inline-block">
            {title}
          </h1>
          
          {!isSettingsPage && (
            <Link to="/settings" className="w-10 h-10 rounded-full bg-white text-[#8DD2BA] border-2 border-[#8DD2BA] shadow-sm flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all">
              <FontAwesomeIcon icon={faGear} className="text-lg" />
            </Link>
          )}
        </div>
      </header>

      {/* 內容區域 */}
      <main className="pt-28 px-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
};