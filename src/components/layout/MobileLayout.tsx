import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
}

export const MobileLayout = ({ children, title }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F7F4EB] w-full flex justify-center font-sans text-gray-700">
      <div className="w-full max-w-lg bg-[#F7F4EB] min-h-screen relative shadow-2xl flex flex-col">
        
        {/* 頂部標題列 */}
        <header className="sticky top-0 z-40 bg-[#F7F4EB]/95 backdrop-blur-sm px-6 py-4 border-b-2 border-orange-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 tracking-wide">
              {title || 'Trip Planner'}
            </h1>
            <div className="w-8 h-8 rounded-full bg-green-600/20" /> 
        </header>

        {/* 內容區域 */}
        <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};