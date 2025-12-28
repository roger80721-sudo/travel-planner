import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrainSubway, faUtensils, faBed, faCamera, faBagShopping, 
  faLocationDot, faClock, faCloudSun, faLightbulb, faScroll, faLocationArrow
} from '@fortawesome/free-solid-svg-icons';

export interface ScheduleItem {
  id: string;
  time: string;
  type: 'transport' | 'food' | 'hotel' | 'activity' | 'shopping';
  title: string;
  duration?: string;
  location?: string;
  weather?: string;
  factSummary?: string;
  factDetails?: string;
}

const TYPE_CONFIG = {
  transport: { icon: faTrainSubway, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
  food:      { icon: faUtensils,    color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
  hotel:     { icon: faBed,         color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  activity:  { icon: faCamera,      color: 'text-green-600',  bg: 'bg-green-100', border: 'border-green-200' },
  shopping:  { icon: faBagShopping, color: 'text-pink-500',   bg: 'bg-pink-100', border: 'border-pink-200' },
};

interface TimelineItemProps {
  item: ScheduleItem;
  isLast: boolean;
  onEditClick: (item: ScheduleItem) => void;
  onFactClick: (item: ScheduleItem) => void;
}

export const TimelineItem = ({ item, isLast, onEditClick, onFactClick }: TimelineItemProps) => {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.activity;
  const hasFact = item.type === 'activity' && item.factSummary;

  // 處理導航點擊
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免觸發編輯 Modal
    if (item.location) {
      // 開啟 Google Maps 導航模式 (travelmode=driving)
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.location)}&travelmode=driving`,
        '_blank'
      );
    }
  };

  return (
    <div className="flex group relative pl-2">
      {!isLast && (
        <div className="absolute left-[27px] top-10 bottom-0 w-0.5 border-l-2 border-dashed border-[#d1cfc7]" />
      )}

      <div className="flex flex-col items-center mr-4 relative z-10">
        <div className="text-[10px] font-black text-[#796C53] mb-1 font-mono">{item.time}</div>
        <div className={`
          w-10 h-10 rounded-full border-4 border-[#F2F4E7] shadow-sm flex items-center justify-center
          ${config.bg} ${config.color}
        `}>
          <FontAwesomeIcon icon={config.icon} className="text-sm" />
        </div>
      </div>

      {/* 卡片本體 */}
      <div 
        onClick={() => onEditClick(item)}
        className={`
          flex-1 mb-6 relative cursor-pointer transition-transform active:scale-95
          bg-[#FFFAFA] rounded-[24px] border-2 border-white
          shadow-[4px_4px_0px_0px_rgba(121,108,83,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(121,108,83,0.2)]
          overflow-hidden
        `}
      >
        <div className={`absolute -top-2 left-6 w-8 h-3 ${config.bg} opacity-50 rotate-[-5deg]`} />

        <div className="p-4 pb-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-black text-[#5E5340] leading-tight mb-1 flex-1">
              {item.title}
            </h3>
            
            {/* ▼▼▼ 新增：自駕導航按鈕 ▼▼▼ */}
            {item.location && (
              <button
                onClick={handleNavigate}
                className="ml-3 w-10 h-10 rounded-full bg-[#4285F4] text-white shadow-md flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform hover:bg-[#3367D6]"
                title="導航到這裡"
              >
                <FontAwesomeIcon icon={faLocationArrow} className="text-sm transform -rotate-45 translate-x-0.5 translate-y-0.5" />
              </button>
            )}
            {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {item.duration && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[#F2F4E7] text-[#796C53] text-[10px] font-bold">
                <FontAwesomeIcon icon={faClock} className="mr-1 opacity-60" />
                {item.duration}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[#E0F2F1] text-[#00695C] text-[10px] font-bold">
                <FontAwesomeIcon icon={faLocationDot} className="mr-1 opacity-60" />
                {item.location}
              </span>
            )}
            {item.weather && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[#FFF3E0] text-[#E65100] text-[10px] font-bold">
                <FontAwesomeIcon icon={faCloudSun} className="mr-1 opacity-60" />
                {item.weather}
              </span>
            )}
          </div>
        </div>

        {hasFact && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onFactClick(item);
            }}
            className="bg-[#FFF8E1] border-t-2 border-dashed border-[#F2F4E7] p-3 flex items-start space-x-2 hover:bg-[#FFF3E0] transition-colors"
          >
             <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 mt-0.5" />
             <div className="flex-1">
               <p className="text-xs font-bold text-[#796C53] line-clamp-2">
                 <span className="text-orange-500 mr-1">冷知識｜</span>
                 {item.factSummary}
               </p>
               <div className="text-[10px] text-orange-400 font-bold mt-1 flex items-center justify-end">
                 <FontAwesomeIcon icon={faScroll} className="mr-1" />
                 點擊看故事
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};