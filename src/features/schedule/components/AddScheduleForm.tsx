import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, faCamera, faTrain, faBed, faBagShopping, faTrashCan, faLocationDot, faClock, // 新增時鐘圖示
  faSun, faCloud, faCloudRain, faSnowflake
} from '@fortawesome/free-solid-svg-icons';
import type { ScheduleItem } from './TimelineItem';

const TYPE_OPTIONS = [
  { value: 'sightseeing', label: '景點', icon: faCamera, color: 'bg-orange-300' },
  { value: 'food', label: '美食', icon: faUtensils, color: 'bg-red-400' },
  { value: 'transport', label: '交通', icon: faTrain, color: 'bg-blue-300' },
  { value: 'shopping', label: '購物', icon: faBagShopping, color: 'bg-yellow-300' },
  { value: 'accommodation', label: '住宿', icon: faBed, color: 'bg-[#88A096]' },
];

const WEATHER_OPTIONS = [
  { value: 'sunny',  icon: faSun,       label: '晴' },
  { value: 'cloudy', icon: faCloud,     label: '雲' },
  { value: 'rainy',  icon: faCloudRain, label: '雨' },
  { value: 'snowy',  icon: faSnowflake, label: '雪' },
];

interface AddFormProps {
  initialData?: ScheduleItem | null;
  onSubmit: (item: Omit<ScheduleItem, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const AddScheduleForm = ({ initialData, onSubmit, onDelete, onCancel }: AddFormProps) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(''); // 新增：持續時間狀態
  const [type, setType] = useState<string>('sightseeing');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTime(initialData.time);
      setDuration(initialData.duration || ''); // 載入持續時間
      setType(initialData.type);
      setLocation(initialData.location || '');
      setWeather(initialData.weather || '');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setTime('10:00');
      setDuration(''); // 重置
      setType('sightseeing');
      setLocation('');
      setWeather('');
      setNotes('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    onSubmit({
      title,
      time,
      duration, // 送出持續時間
      type: type as any,
      location,
      weather: weather as any,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 類型選擇 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">類型</label>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`
                flex items-center space-x-1 px-3 py-2 rounded-xl border-2 transition-all whitespace-nowrap
                ${type === opt.value 
                  ? `${opt.color} border-transparent text-white shadow-md scale-105` 
                  : 'bg-white border-orange-100 text-gray-400'
                }
              `}
            >
              <FontAwesomeIcon icon={opt.icon} className="text-sm" />
              <span className="text-xs font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 時間與持續時間 (同一排) */}
      <div className="flex space-x-3">
        <div className="flex-1">
           <label className="block text-xs font-bold text-gray-400 mb-1">開始時間</label>
           <input 
             type="time" 
             value={time}
             onChange={(e) => setTime(e.target.value)}
             className="w-full bg-white border-2 border-orange-100 rounded-xl px-3 py-3 font-bold text-[#5C4033] focus:border-orange-300 outline-none text-center"
           />
        </div>
        {/* ▼▼▼ 新增的持續時間輸入框 ▼▼▼ */}
        <div className="flex-1">
           <label className="block text-xs font-bold text-gray-400 mb-1">
             <FontAwesomeIcon icon={faClock} className="mr-1" />
             持續 (例如 1.5h)
           </label>
           <input 
             type="text" 
             value={duration}
             onChange={(e) => setDuration(e.target.value)}
             placeholder="1h 30m"
             className="w-full bg-white border-2 border-orange-100 rounded-xl px-3 py-3 font-bold text-gray-600 focus:border-orange-300 outline-none text-center"
           />
        </div>
        {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
      </div>

      {/* 標題 */}
      <div>
         <label className="block text-xs font-bold text-gray-400 mb-1">標題</label>
         <input 
           type="text" 
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           placeholder="例如：吃拉麵"
           className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-orange-300 outline-none"
         />
      </div>

      {/* 地點 */}
      <div>
         <label className="block text-xs font-bold text-gray-400 mb-1">
           <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
           地點 (選填)
         </label>
         <input 
           type="text" 
           value={location}
           onChange={(e) => setLocation(e.target.value)}
           placeholder="輸入地點..."
           className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:border-orange-300 outline-none"
         />
      </div>

      {/* 天氣 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">預測天氣</label>
        <div className="flex space-x-2">
          {WEATHER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setWeather(weather === opt.value ? '' : opt.value)}
              className={`flex-1 py-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-1
                ${weather === opt.value 
                  ? 'border-orange-300 bg-orange-50 text-orange-500' 
                  : 'border-gray-100 bg-white text-gray-300 hover:border-gray-200'}`}
            >
              <FontAwesomeIcon icon={opt.icon} className="text-lg" />
              <span className="text-[10px] font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 備註 */}
      <div>
         <label className="block text-xs font-bold text-gray-400 mb-1">備註</label>
         <textarea 
           value={notes}
           onChange={(e) => setNotes(e.target.value)}
           className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-2 text-sm focus:border-orange-300 outline-none"
           rows={2}
         />
      </div>

      {/* 按鈕 */}
      <div className="pt-4 flex items-center space-x-3">
        {initialData && onDelete && (
          <button 
            type="button" 
            onClick={onDelete}
            className="w-12 h-12 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center border border-red-100"
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        )}
        
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-orange-100 hover:bg-orange-200">
          取消
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg hover:bg-[#4a332a]">
          {initialData ? '儲存修改' : '新增'}
        </button>
      </div>
    </form>
  );
};