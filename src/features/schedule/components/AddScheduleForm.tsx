import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ▼▼▼ 修正：移除了沒用到的 faCloudSun ▼▼▼
import { 
  faTrainSubway, faUtensils, faBed, faCamera, faBagShopping, 
  faLocationDot, faClock, faTrashCan, faLightbulb, faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import type { ScheduleItem } from './TimelineItem';

const TYPE_OPTIONS = [
  { value: 'activity', label: '景點/活動', icon: faCamera, color: 'bg-green-500' },
  { value: 'food', label: '美食', icon: faUtensils, color: 'bg-orange-500' },
  { value: 'shopping', label: '購物', icon: faBagShopping, color: 'bg-pink-500' },
  { value: 'transport', label: '交通', icon: faTrainSubway, color: 'bg-blue-500' },
  { value: 'hotel', label: '住宿', icon: faBed, color: 'bg-indigo-500' },
];

const WEATHER_OPTIONS = [
  { value: 'sunny', label: '晴天', icon: '☀️' },
  { value: 'cloudy', label: '多雲', icon: '☁️' },
  { value: 'rainy', label: '下雨', icon: '🌧️' },
];

interface AddScheduleFormProps {
  initialData?: ScheduleItem | null;
  onSubmit: (item: Omit<ScheduleItem, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const AddScheduleForm = ({ initialData, onSubmit, onDelete, onCancel }: AddScheduleFormProps) => {
  const [type, setType] = useState('activity');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  
  const [factSummary, setFactSummary] = useState('');
  const [factDetails, setFactDetails] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setTime(initialData.time);
      setDuration(initialData.duration || '');
      setLocation(initialData.location || '');
      setWeather(initialData.weather || '');
      setFactSummary(initialData.factSummary || '');
      setFactDetails(initialData.factDetails || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) return;
    onSubmit({
      type: type as any,
      title,
      time,
      duration,
      location,
      weather,
      factSummary: type === 'activity' ? factSummary : undefined,
      factDetails: type === 'activity' ? factDetails : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border-2
              ${type === opt.value 
                ? `bg-white border-[#5C4033] text-[#5C4033] shadow-sm` 
                : 'bg-[#F2F4E7] text-gray-400 border-transparent'}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${opt.color} ${type !== opt.value && 'opacity-50'}`}>
              <FontAwesomeIcon icon={opt.icon} className="text-[10px]" />
            </div>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
           <label className="label-text">標題</label>
           <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：清水寺" className="input-style w-full text-lg" />
        </div>

        <div className="flex space-x-2">
           <div className="flex-1">
             <label className="label-text"><FontAwesomeIcon icon={faClock} className="mr-1" />開始時間</label>
             <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-style w-full text-center font-mono" />
           </div>
           <div className="flex-1">
             <label className="label-text">預計停留</label>
             <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="例如：2h" className="input-style w-full text-center" />
           </div>
        </div>

        <div>
          <label className="label-text"><FontAwesomeIcon icon={faLocationDot} className="mr-1" />地點/地址</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="選填" className="input-style w-full" />
        </div>
        
        {type === 'activity' && (
          <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100 space-y-3">
             <h3 className="font-bold text-yellow-700 flex items-center">
               <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
               景點小導遊
             </h3>
             
             <div>
               <label className="label-text text-yellow-600">冷知識簡述 (顯示在卡片上)</label>
               <input 
                 type="text" 
                 value={factSummary} 
                 onChange={e => setFactSummary(e.target.value)} 
                 placeholder="一句話吸引目光，例如：你知道這裡的柱子沒用一根釘子嗎？" 
                 className="input-style w-full border-yellow-200 focus:border-yellow-400" 
                 maxLength={50}
               />
             </div>

             <div>
               <label className="label-text text-yellow-600 flex items-center">
                 <FontAwesomeIcon icon={faBookOpen} className="mr-1" />
                 詳細歷史故事
               </label>
               <textarea 
                 value={factDetails} 
                 onChange={e => setFactDetails(e.target.value)} 
                 placeholder="在這裡寫下詳細的故事或背景介紹..." 
                 className="input-style w-full h-32 resize-none border-yellow-200 focus:border-yellow-400"
               />
             </div>
          </div>
        )}

        <div>
          <label className="label-text block mb-1">預測天氣</label>
          <div className="flex space-x-2">
            {WEATHER_OPTIONS.map(w => (
              <button
                key={w.value}
                type="button"
                onClick={() => setWeather(weather === w.value ? '' : w.value)}
                className={`flex-1 py-2 rounded-xl font-bold text-xl border-2 transition-all
                  ${weather === w.value ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 opacity-50 hover:opacity-100'}`}
              >
                {w.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex space-x-3">
        {onDelete && (
          <button type="button" onClick={onDelete} className="px-4 py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors">
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        )}
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-[#F2F4E7] hover:bg-[#E8EAE0] transition-colors">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg hover:bg-[#4a332a] transition-colors">儲存</button>
      </div>

      <style>{`
        .label-text { font-size: 0.75rem; font-weight: 800; color: #796C53; margin-bottom: 0.25rem; display: block; }
        .input-style { background: white; border: 2px solid #F2F4E7; border-radius: 0.75rem; padding: 0.75rem 1rem; font-weight: 700; color: #5E5340; outline: none; transition: all; }
        .input-style:focus { border-color: #F3A76C; }
      `}</style>
    </form>
  );
};