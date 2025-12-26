import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrainSubway, faUtensils, faBed, faCamera, faBagShopping, 
  faLocationDot, faClock, faCloudSun 
} from '@fortawesome/free-solid-svg-icons'; // 修正：移除了沒用到的 faPlane

export interface ScheduleItem {
  id: string;
  time: string;
  type: 'transport' | 'food' | 'hotel' | 'activity' | 'shopping';
  title: string;
  duration?: string;
  location?: string;
  weather?: string;
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
  onClick: (item: ScheduleItem) => void;
}

export const TimelineItem = ({ item, isLast, onClick }: TimelineItemProps) => {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.activity;

  return (
    <div className="flex group relative pl-2">
      {/* 左側時間軸線 (虛線) */}
      {!isLast && (
        <div className="absolute left-[27px] top-10 bottom-0 w-0.5 border-l-2 border-dashed border-[#d1cfc7]" />
      )}

      {/* 左側時間與圖示 */}
      <div className="flex flex-col items-center mr-4 relative z-10">
        <div className="text-[10px] font-black text-[#796C53] mb-1 font-mono">{item.time}</div>
        <div className={`
          w-10 h-10 rounded-full border-4 border-[#F2F4E7] shadow-sm flex items-center justify-center
          ${config.bg} ${config.color}
        `}>
          <FontAwesomeIcon icon={config.icon} className="text-sm" />
        </div>
      </div>

      {/* 右側卡片 (DIY 方程式卡片風格) */}
      <div 
        onClick={() => onClick(item)}
        className={`
          flex-1 mb-6 relative cursor-pointer transition-transform active:scale-95
          bg-[#FFFAFA] rounded-[24px] border-2 border-white
          shadow-[4px_4px_0px_0px_rgba(121,108,83,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(121,108,83,0.2)]
        `}
      >
        {/* 卡片裝飾：左上角的彩色膠帶效果 */}
        <div className={`absolute -top-2 left-6 w-8 h-3 ${config.bg} opacity-50 rotate-[-5deg]`} />

        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-black text-[#5E5340] leading-tight mb-1">{item.title}</h3>
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
      </div>
    </div>
  );
};