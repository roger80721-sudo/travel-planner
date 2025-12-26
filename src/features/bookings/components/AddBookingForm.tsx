import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBed, faTicket, faSuitcase } from '@fortawesome/free-solid-svg-icons'; // 修正：移除了沒用到的圖示
import type { BookingItem } from './BookingCard';

const TYPE_OPTIONS = [
  { value: 'flight', label: '機票', icon: faPlane },
  { value: 'hotel', label: '住宿', icon: faBed },
  { value: 'activity', label: '票券', icon: faTicket },
];

interface AddBookingFormProps {
  initialData?: BookingItem | null;
  onSubmit: (item: Omit<BookingItem, 'id'>) => void;
  onCancel: () => void;
}

export const AddBookingForm = ({ initialData, onSubmit, onCancel }: AddBookingFormProps) => {
  const [type, setType] = useState('flight');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reference, setReference] = useState('');
  const [link, setLink] = useState('');

  // 機票專屬欄位
  const [departCode, setDepartCode] = useState('');
  const [departName, setDepartName] = useState('');
  const [arriveCode, setArriveCode] = useState('');
  const [arriveName, setArriveName] = useState('');
  const [baggage, setBaggage] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setProvider(initialData.provider);
      setDate(initialData.date);
      setTime(initialData.time);
      setReference(initialData.reference || '');
      setLink(initialData.link || '');
      
      setDepartCode(initialData.departCode || '');
      setDepartName(initialData.departName || '');
      setArriveCode(initialData.arriveCode || '');
      setArriveName(initialData.arriveName || '');
      setBaggage(initialData.baggage || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmit({
      type: type as any,
      title,
      provider,
      date,
      time,
      reference,
      link,
      departCode: type === 'flight' ? departCode : undefined,
      departName: type === 'flight' ? departName : undefined,
      arriveCode: type === 'flight' ? arriveCode : undefined,
      arriveName: type === 'flight' ? arriveName : undefined,
      baggage: type === 'flight' ? baggage : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      {/* 類型選擇 */}
      <div className="flex space-x-2 bg-white p-1 rounded-xl border-2 border-orange-100">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1
              ${type === opt.value ? 'bg-[#5C4033] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <FontAwesomeIcon icon={opt.icon} />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {/* 基本資訊 */}
        <div className="flex space-x-2">
           <div className="flex-1">
             <label className="block text-xs font-bold text-gray-400 mb-1">
                {type === 'flight' ? '航空公司' : '供應商/地點'}
             </label>
             <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder={type === 'flight' ? "例如：星宇航空" : "Agoda"} className="w-full input-style" />
           </div>
           <div className="flex-1">
             <label className="block text-xs font-bold text-gray-400 mb-1">
                {type === 'flight' ? '航班代號' : '標題/房型'}
             </label>
             <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={type === 'flight' ? "JX821" : "雙人房"} className="w-full input-style" />
           </div>
        </div>

        {/* 機票專屬輸入區 */}
        {type === 'flight' && (
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 space-y-3">
            <h4 className="text-xs font-bold text-blue-500 mb-2">✈️ 航段資訊</h4>
            
            <div className="flex space-x-2">
              <div className="w-1/3">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">出發代號</label>
                <input type="text" value={departCode} onChange={e => setDepartCode(e.target.value.toUpperCase())} placeholder="TPE" className="w-full input-style text-center font-mono" maxLength={3} />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">出發機場</label>
                <input type="text" value={departName} onChange={e => setDepartName(e.target.value)} placeholder="桃園機場" className="w-full input-style" />
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="w-1/3">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">抵達代號</label>
                <input type="text" value={arriveCode} onChange={e => setArriveCode(e.target.value.toUpperCase())} placeholder="KIX" className="w-full input-style text-center font-mono" maxLength={3} />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">抵達機場</label>
                <input type="text" value={arriveName} onChange={e => setArriveName(e.target.value)} placeholder="關西機場" className="w-full input-style" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1">
                <FontAwesomeIcon icon={faSuitcase} className="mr-1" />
                託運行李限額
              </label>
              <input type="text" value={baggage} onChange={e => setBaggage(e.target.value)} placeholder="例如：23kg x 2" className="w-full input-style" />
            </div>
          </div>
        )}

        <div className="flex space-x-2">
           <div className="flex-1">
             <label className="block text-xs font-bold text-gray-400 mb-1">日期</label>
             <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full input-style" />
           </div>
           <div className="w-1/3">
             <label className="block text-xs font-bold text-gray-400 mb-1">時間</label>
             <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full input-style" />
           </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-400 mb-1">訂位代號</label>
           <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="6碼代號" className="w-full input-style text-orange-600 font-mono font-bold" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">相關連結</label>
          <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="w-full input-style text-blue-500" />
        </div>
      </div>

      <div className="pt-2 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-orange-100">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存</button>
      </div>
    </form>
  );
};