import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrainSubway, faUtensils, faBed, faCamera, faBagShopping, 
  faLocationDot, faClock, faTrashCan, faLightbulb, faBookOpen, 
  faWandMagicSparkles, faSpinner, faCloudBolt, faNoteSticky
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
  date: string;
  onSubmit: (item: Omit<ScheduleItem, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const AddScheduleForm = ({ initialData, date, onSubmit, onDelete, onCancel }: AddScheduleFormProps) => {
  const [type, setType] = useState('activity');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  
  const [coldKnowledge, setColdKnowledge] = useState('');
  const [historyDescription, setHistoryDescription] = useState('');
  // 新增：備註狀態
  const [notes, setNotes] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setTime(initialData.time);
      setDuration(initialData.duration || '');
      setLocation(initialData.location || '');
      setWeather(initialData.weather || '');
      setColdKnowledge(initialData.coldKnowledge || '');
      setHistoryDescription(initialData.historyDescription || '');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  // ▼▼▼ 修正後的維基百科搜尋 ▼▼▼
  const handleAutoGenerate = async () => {
    if (!title) {
      alert('請先輸入「標題」才能搜尋喔！');
      return;
    }

    setIsSearching(true);
    try {
      // 關鍵修正：加入 &redirects=1 參數，讓 API 自動處理繁簡轉換或別名重導向
      const response = await fetch(
        `https://zh.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1') {
        alert('抱歉，維基百科找不到這個景點的資料 😅');
      } else {
        const fullText = pages[pageId].extract;
        
        // 自動填入詳細歷史
        setHistoryDescription(fullText);
        
        // 自動填入冷知識 (取前段文字)
        const summary = fullText.substring(0, 45).replace(/\n/g, '') + '...';
        setColdKnowledge(summary); 
      }
    } catch (error) {
      alert('網路連線錯誤，無法搜尋');
    } finally {
      setIsSearching(false);
    }
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const handleAutoWeather = async () => {
    const tripDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 14) {
      alert(`⚠️ 抱歉！目前日期 (${date}) 太遠了。\n氣象預報通常只能查詢未來 14 天內的天氣喔！`);
      return;
    }

    const searchLoc = location || title;
    if (!searchLoc) {
      alert('請先輸入「地點」或「標題」才能查詢天氣！');
      return;
    }

    setIsWeatherLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchLoc)}&count=1&language=zh&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert('找不到這個地點的經緯度 😭');
        setIsWeatherLoading(false);
        return;
      }

      const { latitude, longitude } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${date}&end_date=${date}`
      );
      const weatherData = await weatherRes.json();

      if (!weatherData.daily) {
        alert('無法取得該日期的氣象資料。');
        setIsWeatherLoading(false);
        return;
      }

      const code = weatherData.daily.weather_code[0];
      const maxTemp = weatherData.daily.temperature_2m_max[0];
      const minTemp = weatherData.daily.temperature_2m_min[0];

      if (code <= 1) setWeather('sunny');
      else if (code <= 48) setWeather('cloudy');
      else setWeather('rainy');

      const tempString = ` (${minTemp}°C~${maxTemp}°C)`;
      if (!location.includes('°C')) {
         setLocation((prev) => prev ? prev + tempString : searchLoc + tempString);
      }
      alert(`查詢成功！\n天氣：${code <= 1 ? '晴天' : code <= 48 ? '多雲' : '下雨'}\n氣溫：${minTemp}°C ~ ${maxTemp}°C`);

    } catch (error) {
      console.error(error);
      alert('查詢失敗，請檢查網路連線。');
    } finally {
      setIsWeatherLoading(false);
    }
  };

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
      notes, // 儲存備註
      coldKnowledge: type === 'activity' ? coldKnowledge : undefined,
      historyDescription: type === 'activity' ? historyDescription : undefined,
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
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="建議填寫，以便查詢天氣" className="input-style w-full" />
        </div>

        {/* ▼▼▼ 新增：備註輸入框 ▼▼▼ */}
        <div>
          <label className="label-text flex items-center">
            <FontAwesomeIcon icon={faNoteSticky} className="mr-1 text-gray-400" />
            備註 (選填)
          </label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="例如：3號出口集合、記得帶御朱印帳..." 
            className="input-style w-full h-20 resize-none text-sm"
          />
        </div>
        {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
        
        {type === 'activity' && (
          <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100 space-y-3 relative overflow-hidden">
             
             <div className="flex justify-between items-center">
               <h3 className="font-bold text-yellow-700 flex items-center">
                 <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                 景點小導遊
               </h3>
               
               <button 
                 type="button"
                 onClick={handleAutoGenerate}
                 disabled={isSearching || !title}
                 className="text-xs bg-white text-yellow-600 border border-yellow-300 px-3 py-1.5 rounded-full font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center"
               >
                 {isSearching ? <FontAwesomeIcon icon={faSpinner} spin className="mr-1" /> : <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-1" />}
                 {isSearching ? '搜尋中...' : '自動搜尋'}
               </button>
             </div>
             
             <div>
               <label className="label-text text-yellow-600">💡 冷知識 (有趣的短知識)</label>
               <input 
                 type="text" 
                 value={coldKnowledge} 
                 onChange={e => setColdKnowledge(e.target.value)} 
                 placeholder="例如：這裡的柱子沒用一根釘子" 
                 className="input-style w-full border-yellow-200 focus:border-yellow-400" 
               />
             </div>

             <div>
               <label className="label-text text-yellow-600 flex items-center">
                 <FontAwesomeIcon icon={faBookOpen} className="mr-1" />
                 📖 歷史故事 (詳細背景)
               </label>
               <textarea 
                 value={historyDescription} 
                 onChange={e => setHistoryDescription(e.target.value)} 
                 placeholder="這裡會自動填入維基百科的詳細介紹..." 
                 className="input-style w-full h-32 resize-none border-yellow-200 focus:border-yellow-400"
               />
             </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
             <label className="label-text">預測天氣</label>
             <button
               type="button"
               onClick={handleAutoWeather}
               disabled={isWeatherLoading}
               className="text-xs text-blue-500 font-bold flex items-center bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
             >
               {isWeatherLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-1" /> : <FontAwesomeIcon icon={faCloudBolt} className="mr-1" />}
               自動氣象
             </button>
          </div>
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