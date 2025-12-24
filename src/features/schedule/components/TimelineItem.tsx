import {
  faBagShopping,
  faBed,
  faBolt,
  faCamera,
  faCloud, faCloudRain,
  faMagnifyingGlass // 新增放大鏡圖示
  ,
  faMapLocationDot,
  faSnowflake,
  faSun,
  faTrain,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location?: string;
  type: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'shopping';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'storm';
  duration?: string;
  notes?: string;
}

const TYPE_CONFIG = {
  sightseeing: { color: 'bg-orange-300', icon: faCamera, label: '景點' },
  food:        { color: 'bg-red-400',    icon: faUtensils, label: '美食' },
  transport:   { color: 'bg-blue-300',   icon: faTrain,    label: '交通' },
  accommodation:{ color: 'bg-[#88A096]', icon: faBed,      label: '住宿' },
  shopping:    { color: 'bg-yellow-300', icon: faBagShopping, label: '購物' },
};

const WEATHER_CONFIG = {
  sunny:  { icon: faSun,       color: 'text-orange-400', label: '晴天' },
  cloudy: { icon: faCloud,     color: 'text-gray-400',   label: '多雲' },
  rainy:  { icon: faCloudRain, color: 'text-blue-400',   label: '雨天' },
  snowy:  { icon: faSnowflake, color: 'text-blue-200',   label: '下雪' },
  storm:  { icon: faBolt,      color: 'text-yellow-500', label: '雷雨' },
};

interface TimelineItemProps {
  item: ScheduleItem;
  isLast?: boolean;
  onClick: (item: ScheduleItem) => void;
}

export const TimelineItem = ({ item, isLast, onClick }: TimelineItemProps) => {
  const config = TYPE_CONFIG[item.type];
  const weatherInfo = item.weather ? WEATHER_CONFIG[item.weather] : null;

  // 這是一個防止點擊連結時，觸發「編輯視窗」的小功能
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex group">
      {/* 左側時間 */}
      <div className="flex flex-col items-end mr-4 w-12 pt-1">
        <span className="text-sm font-bold text-[#5C4033] font-mono">{item.time}</span>
        {item.duration && (
          <span className="text-[10px] text-gray-400 mt-1 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {item.duration}
          </span>
        )}
      </div>

      {/* 中間軸線 */}
      <div className="relative flex flex-col items-center mr-4">
        <div className={`w-4 h-4 rounded-full border-2 border-white z-10 shadow-sm ${config.color}`} />
        {!isLast && (
          <div className="w-0.5 flex-grow bg-gray-200 border-l-2 border-dashed border-gray-300 my-1" />
        )}
      </div>

      {/* 右側卡片 */}
      <div className="flex-1 pb-8">
        <div 
          onClick={() => onClick(item)}
          className="bg-white rounded-2xl border-2 border-transparent shadow-[4px_4px_0px_0px_#E0E5D5] p-4 flex flex-col relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer hover:border-orange-200"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-2 ${config.color}`} />
          
          <div className="pl-2 flex justify-between items-start mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${config.color}`}>
              {config.label}
            </span>
            
            {/* 顯示天氣圖示 (如果你有手動設定的話) */}
            {weatherInfo && (
              <div className={`flex items-center space-x-1 ${weatherInfo.color}`}>
                <FontAwesomeIcon icon={weatherInfo.icon} className="text-lg" />
              </div>
            )}
          </div>
          
          <h3 className="pl-2 text-lg font-bold text-gray-700 leading-tight mb-1">{item.title}</h3>
          
          {/* ▼▼▼ 重點修改：地點與按鈕區 ▼▼▼ */}
          {item.location && (
            <div className="pl-2 mt-2 flex flex-wrap gap-2">
              
              {/* 1. 地圖按鈕 (藍色) */}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${item.location}`}
                target="_blank" 
                rel="noreferrer"
                onClick={handleLinkClick}
                className="inline-flex items-center text-xs text-blue-600 font-bold hover:text-blue-800 bg-blue-50 border border-blue-100 px-2 py-1.5 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faMapLocationDot} className="mr-1.5" />
                地圖
              </a>

              {/* 2. 氣象按鈕 (橘色) - 點下去會自動 Google 搜尋 */}
              <a 
                href={`https://www.google.com/search?q=${item.location}+天氣`}
                target="_blank" 
                rel="noreferrer"
                onClick={handleLinkClick}
                className="inline-flex items-center text-xs text-orange-600 font-bold hover:text-orange-800 bg-orange-50 border border-orange-100 px-2 py-1.5 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-1.5" />
                氣象
              </a>

            </div>
          )}
          {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
          
          {item.notes && (
            <p className="ml-2 mt-2 text-xs text-gray-500 bg-[#F7F4EB] p-2 rounded-lg line-clamp-2">
              {item.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};