import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDays, faSuitcase, faWallet, faBook, faListCheck, faLeaf 
} from '@fortawesome/free-solid-svg-icons';

// 定義每個 App 的顏色，模仿 NookPhone 的配色
const NAV_ITEMS = [
  { path: '/', label: '行程', icon: faCalendarDays, color: 'bg-[#F3A76C]', iconColor: 'text-white' }, // 橘色 (像護照)
  { path: '/bookings', label: '預訂', icon: faSuitcase, color: 'bg-[#7CAFC4]', iconColor: 'text-white' }, // 藍色
  { path: '/expense', label: '記帳', icon: faWallet, color: 'bg-[#F5E050]', iconColor: 'text-[#5E5340]' }, // 黃色 (像鈴錢)
  { path: '/journal', label: '日誌', icon: faBook, color: 'bg-[#96E0C5]', iconColor: 'text-[#367A60]' }, // 淺綠
  { path: '/preparation', label: '準備', icon: faListCheck, color: 'bg-[#BCAAA4]', iconColor: 'text-white' }, // 棕灰
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md rounded-[32px] px-2 py-3 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-white z-30 flex justify-around items-center">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="group flex flex-col items-center justify-center w-14 transition-transform active:scale-90"
          >
            {/* App 圖示外框 */}
            <div className={`
              w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm transition-all duration-300 relative
              ${item.color}
              ${isActive ? '-translate-y-2 shadow-md scale-110 ring-2 ring-white' : 'opacity-80 grayscale-[0.3] hover:grayscale-0'}
            `}>
              <FontAwesomeIcon icon={item.icon} className={`text-lg ${item.iconColor}`} />
              
              {/* 選中時的小葉子標記 */}
              {isActive && (
                <div className="absolute -top-2 -right-2 text-[#3AA986] bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  <FontAwesomeIcon icon={faLeaf} className="text-[8px]" />
                </div>
              )}
            </div>
            
            {/* App 名稱 */}
            <span className={`
              text-[10px] font-black mt-1 tracking-widest transition-all duration-300
              ${isActive ? 'text-[#5E5340] opacity-100' : 'text-gray-400 opacity-0 h-0'}
            `}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};