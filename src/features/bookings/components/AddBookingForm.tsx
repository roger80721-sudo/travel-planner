import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, faHotel, faTicket, faCalendarDays, faClock, 
  faLocationDot, faSuitcaseRolling, faImage, faPlaneDeparture, faPlaneArrival, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import type { BookingItem } from './BookingCard';

interface AddBookingFormProps {
  initialData?: BookingItem | null;
  onSubmit: (item: Omit<BookingItem, 'id'>) => void;
  onCancel: () => void;
}

export const AddBookingForm = ({ initialData, onSubmit, onCancel }: AddBookingFormProps) => {
  const [type, setType] = useState<'flight' | 'hotel' | 'activity'>('flight');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reference, setReference] = useState('');
  const [link, setLink] = useState('');
  
  // 機票專屬
  const [departCode, setDepartCode] = useState('');
  const [arriveCode, setArriveCode] = useState('');
  const [arriveTime, setArriveTime] = useState('');
  const [baggage, setBaggage] = useState('');
  
  // 住宿/活動專屬
  const [checkOutDate, setCheckOutDate] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setProvider(initialData.provider || '');
      setDate(initialData.date);
      setTime(initialData.time || '');
      setReference(initialData.reference || '');
      setLink(initialData.link || '');
      
      setDepartCode(initialData.departCode || '');
      setArriveCode(initialData.arriveCode || '');
      setArriveTime(initialData.arriveTime || '');
      setBaggage(initialData.baggage || '');
      
      setCheckOutDate(initialData.checkOutDate || '');
      setAddress(initialData.address || '');
      setImage(initialData.image || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    onSubmit({
      type, title, provider, date, time, reference, link,
      departCode: type === 'flight' ? departCode : undefined,
      // 移除 departName
      arriveCode: type === 'flight' ? arriveCode : undefined,
      // 移除 arriveName
      arriveTime: type === 'flight' ? arriveTime : undefined,
      baggage: type === 'flight' ? baggage : undefined,
      checkOutDate: type === 'hotel' ? checkOutDate : undefined,
      address: type !== 'flight' ? address : undefined,
      image: type !== 'flight' ? image : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden px-1">
      {/* 類型選擇 */}
      <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
        {[
          { id: 'flight', label: '機票', icon: faPlane },
          { id: 'hotel', label: '住宿', icon: faHotel },
          { id: 'activity', label: '票券/活動', icon: faTicket },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all whitespace-nowrap
              ${type === t.id ? 'bg-white text-[#5C4033] shadow-sm' : 'text-gray-400'}`}
          >
            <FontAwesomeIcon icon={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">標題</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder={type === 'flight' ? '例如：去程班機 (TPE-NRT)' : '例如：東京灣希爾頓'} 
          className="w-full input-style"
        />
      </div>

      {/* ✈️ 機票專屬欄位 */}
      {type === 'flight' && (
        <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
          
          <div className="flex space-x-3">
            <div className="flex-[1.5]">
              <label className="label-sub">航空公司</label>
              <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="例如：星宇航空" className="w-full input-style" />
            </div>
            <div className="flex-1">
              <label className="label-sub">班機號碼</label>
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="JX800" className="w-full input-style font-mono uppercase" />
            </div>
          </div>

          <div className="my-2 border-t border-blue-100/50"></div>

          {/* 🛫 出發區塊 (垂直) */}
          <div>
            <h4 className="text-sm font-black text-[#5C4033] mb-2 flex items-center">
                <FontAwesomeIcon icon={faPlaneDeparture} className="mr-2 text-blue-400"/>出發資訊 (Departure)
            </h4>
            <div className="space-y-3 pl-2">
                <div>
                    <label className="label-sub">機場代碼 (例如：TPE)</label>
                    {/* ✅ 修正：移除多餘的輸入框，讓代碼欄位佔滿整行 */}
                    <input 
                      type="text" 
                      value={departCode} 
                      onChange={e => setDepartCode(e.target.value)} 
                      placeholder="TPE" 
                      className="w-full text-center input-style font-mono uppercase text-lg tracking-widest" 
                      maxLength={3} 
                    />
                </div>
                <div className="flex space-x-3">
                    <div className="flex-[1.5]">
                        <label className="label-sub"><FontAwesomeIcon icon={faCalendarDays} className="mr-1"/>出發日期</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full input-style" />
                    </div>
                    <div className="flex-1">
                        <label className="label-sub"><FontAwesomeIcon icon={faClock} className="mr-1"/>出發時間</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full input-style text-center" />
                    </div>
                </div>
            </div>
          </div>

          <div className="flex justify-center py-1">
            <FontAwesomeIcon icon={faArrowDown} className="text-blue-200 animate-bounce" />
          </div>

          {/* 🛬 抵達區塊 (垂直) */}
          <div>
             <h4 className="text-sm font-black text-[#5C4033] mb-2 flex items-center">
                <FontAwesomeIcon icon={faPlaneArrival} className="mr-2 text-teal-400"/>抵達資訊 (Arrival)
            </h4>
            <div className="space-y-3 pl-2">
                <div>
                    <label className="label-sub">機場代碼 (例如：NRT)</label>
                    {/* ✅ 修正：移除多餘的輸入框 */}
                    <input 
                      type="text" 
                      value={arriveCode} 
                      onChange={e => setArriveCode(e.target.value)} 
                      placeholder="NRT" 
                      className="w-full text-center input-style font-mono uppercase text-lg tracking-widest" 
                      maxLength={3} 
                    />
                </div>
                <div>
                    <label className="label-sub"><FontAwesomeIcon icon={faClock} className="mr-1"/>抵達時間</label>
                    <input type="time" value={arriveTime} onChange={e => setArriveTime(e.target.value)} className="w-full input-style text-center" />
                </div>
            </div>
          </div>

          <div className="my-2 border-t border-blue-100/50"></div>

          <div>
             <label className="label-sub"><FontAwesomeIcon icon={faSuitcaseRolling} className="mr-1" />行李額度</label>
             <input type="text" value={baggage} onChange={e => setBaggage(e.target.value)} placeholder="例如：托運 23kg x 2 / 手提 7kg" className="w-full input-style" />
          </div>
        </div>
      )}

      {/* 🏨 住宿/活動專屬欄位 (保持不變) */}
      {type !== 'flight' && (
        <>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-1">供應商/平台</label>
              <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="例如：Agoda / Klook" className="w-full input-style" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-1">訂單編號</label>
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="Ref No." className="w-full input-style font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1"><FontAwesomeIcon icon={faLocationDot} className="mr-1"/>地址/集合點</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="輸入地址..." className="w-full input-style" />
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <label className="block text-xs font-bold text-gray-400 mb-2 flex items-center">
               <FontAwesomeIcon icon={faImage} className="mr-1" /> 封面照片 (圖片網址)
             </label>
             <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className="w-full input-style text-xs" />
             {image && <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-white"><img src={image} alt="預覽" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} /></div>}
          </div>

          {/* 通用時間欄位 */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-1"><FontAwesomeIcon icon={faCalendarDays} className="mr-1"/>日期/入住</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full input-style" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-1"><FontAwesomeIcon icon={faClock} className="mr-1"/>時間</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full input-style text-center" />
            </div>
          </div>
        </>
      )}

      {type === 'hotel' && (
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">退房日期</label>
          <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full input-style" />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">連結 (Google Map 或 訂單頁面)</label>
        <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://" className="w-full input-style text-blue-500" />
      </div>

      <div className="pt-4 flex space-x-3 shrink-0">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-[#F2F4E7]">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存</button>
      </div>

      <style>{`
        .input-style { background: white; border: 2px solid #F3F4F6; border-radius: 0.75rem; padding: 0.6rem 1rem; font-weight: 700; color: #5E5340; outline: none; transition: all; width: 100%; }
        .input-style:focus { border-color: #FDBA74; }
        .label-sub { font-size: 0.65rem; font-weight: 800; color: #9CA3AF; margin-bottom: 0.1rem; display: block; }
      `}</style>
    </form>
  );
};