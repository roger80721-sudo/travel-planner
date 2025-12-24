import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBed, faTicket } from '@fortawesome/free-solid-svg-icons';
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

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setProvider(initialData.provider);
      setDate(initialData.date);
      setTime(initialData.time);
      setReference(initialData.reference || '');
      setLink(initialData.link || '');
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
      link
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">標題</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：去程機票 / 大阪希爾頓" className="w-full input-style" />
        </div>
        
        <div className="flex space-x-2">
           <div className="flex-1">
             <label className="block text-xs font-bold text-gray-400 mb-1">供應商/航司</label>
             <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="例如：長榮航空" className="w-full input-style" />
           </div>
           <div className="flex-1">
             <label className="block text-xs font-bold text-gray-400 mb-1">訂位代號</label>
             <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="6碼代號" className="w-full input-style text-orange-600 font-mono font-bold" />
           </div>
        </div>

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
          <label className="block text-xs font-bold text-gray-400 mb-1">相關連結 (URL)</label>
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