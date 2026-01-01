import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSuitcaseRolling, faClipboardList, faTicket, faWallet, faGear 
} from '@fortawesome/free-solid-svg-icons';

import { SchedulePage } from './features/schedule/SchedulePage';
import { PreparationPage } from './features/preparation/PreparationPage';
import { BookingsPage } from './features/bookings/BookingsPage';
import { ExpensePage } from './features/expense/ExpensePage';
import { SettingsPage } from './features/settings/SettingsPage'; // ✅ 引入新頁面

function App() {
  const [activeTab, setActiveTab] = useState('schedule');

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule': return <SchedulePage />;
      case 'preparation': return <PreparationPage />;
      case 'bookings': return <BookingsPage />;
      case 'expense': return <ExpensePage />;
      case 'settings': return <SettingsPage />; // ✅ 新增路由
      default: return <SchedulePage />;
    }
  };

  return (
    <div className="app-container font-sans bg-[#FBFBFB] min-h-screen text-[#5E5340] selection:bg-orange-200">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-[#FFFAFA]">
        
        {renderContent()}

        {/* 底部導覽列 */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-white/90 backdrop-blur-md border-2 border-[#F2F4E7] rounded-3xl shadow-xl flex justify-around items-center px-2 py-3 z-50">
          {[
            { id: 'schedule', icon: faSuitcaseRolling, label: '行程' },
            { id: 'preparation', icon: faClipboardList, label: '準備' },
            { id: 'bookings', icon: faTicket, label: '預訂' },
            { id: 'expense', icon: faWallet, label: '記帳' },
            { id: 'settings', icon: faGear, label: '設定' }, // ✅ 新增設定按鈕
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300
                ${activeTab === tab.id ? 'bg-[#5C4033] text-white shadow-lg scale-110 -translate-y-2' : 'text-gray-300 hover:text-[#5C4033] hover:bg-orange-50'}`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-lg mb-1" />
              <span className="text-[9px] font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;