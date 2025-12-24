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
  // 注意：這裡的路徑必須跟 App.tsx 裡的一模一樣
  { path: '/preparation', label: '準備', icon: faListCheck },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-end z-30">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="flex flex-col items-center space-y-1 w-12"
          >
            <div className={`transition-all duration-300 ${isActive ? 'text-[#5C4033] -translate-y-2 scale-110' : 'text-gray-300'}`}>
              <FontAwesomeIcon icon={item.icon} className="text-xl" />
            </div>
            <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'text-[#5C4033] opacity-100' : 'text-gray-300 opacity-0 h-0 overflow-hidden'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-[#5C4033] absolute -bottom-2" />
            )}
          </Link>
        );
      })}
    </div>
  );
};