import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDays, 
  faSuitcase, 
  faWallet, 
  faBook, 
  faListCheck 
} from '@fortawesome/free-solid-svg-icons';

const NAV_ITEMS = [
  { path: '/', label: '行程', icon: faCalendarDays },
  { path: '/bookings', label: '預訂', icon: faSuitcase },
  { path: '/expense', label: '記帳', icon: faWallet },
  { path: '/journal', label: '日誌', icon: faBook },
  { path: '/preparation', label: '準備', icon: faListCheck },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 pb-6 flex justify-around items-end z-30">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="flex flex-col items-center justify-center w-16 space-y-1"
          >
            {/* 圖示：被選中時會往上浮一點點，顏色變深 */}
            <div className={`transition-all duration-300 ${isActive ? 'text-[#5C4033] -translate-y-1' : 'text-gray-300'}`}>
              <FontAwesomeIcon icon={item.icon} className="text-xl" />
            </div>
            
            {/* 文字：永遠顯示，只變顏色 */}
            <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-[#5C4033]' : 'text-gray-300'}`}>
              {item.label}
            </span>
            
            {/* 底部小圓點：被選中時才顯示 */}
            <div className={`w-1 h-1 rounded-full bg-[#5C4033] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
          </Link>
        );
      })}
    </div>
  );
};