import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, faTrainSubway, faBagShopping, faTicket, faEllipsis, 
  faMoneyBill, faCreditCard, faMobileScreen, faIdCard,
  faLocationDot, faImage, faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';
import type { ExpenseItem } from './ExpenseCard';

const CATEGORIES = [
  { id: 'food', label: '餐飲', icon: faUtensils, color: 'bg-orange-100 text-orange-500' },
  { id: 'transport', label: '交通', icon: faTrainSubway, color: 'bg-blue-100 text-blue-500' },
  { id: 'shopping', label: '購物', icon: faBagShopping, color: 'bg-pink-100 text-pink-500' },
  { id: 'entertainment', label: '娛樂', icon: faTicket, color: 'bg-purple-100 text-purple-500' },
  { id: 'other', label: '其他', icon: faEllipsis, color: 'bg-gray-100 text-gray-500' },
];

const PAYMENT_METHODS = [
  { id: 'cash', label: '現金', icon: faMoneyBill },
  { id: 'card', label: '信用卡', icon: faCreditCard },
  { id: 'suica', label: '西瓜卡', icon: faIdCard },
  { id: 'mobile', label: 'Pay', icon: faMobileScreen },
];

interface AddExpenseFormProps {
  initialData?: ExpenseItem | null;
  members: string[];
  onSubmit: (data: Omit<ExpenseItem, 'id'>) => void;
  onCancel: () => void;
}

export const AddExpenseForm = ({ initialData, members, onSubmit, onCancel }: AddExpenseFormProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [payer, setPayer] = useState(members[0] || '我');
  const [involved, setInvolved] = useState<string[]>(members);
  const [method, setMethod] = useState('cash');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setPayer(initialData.payer || members[0]);
      setInvolved(initialData.involved || members);
      setMethod(initialData.method || 'cash');
      setLocation(initialData.location || '');
      setPhotoUrl(initialData.photoUrl || '');
    }
  }, [initialData, members]);

  const toggleInvolved = (member: string) => {
    setInvolved(prev => {
      if (prev.includes(member)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== member);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSearchImage = () => {
    if (!title) return alert('請先輸入項目名稱！');
    const query = `${location} ${title}`;
    window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    onSubmit({
      title,
      amount: Number(amount),
      category,
      date,
      payer,
      involved,
      method: method as any,
      location,
      photoUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <div className="flex space-x-3">
        <div className="flex-1">
          <label className="label-text">名稱</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：章魚燒" className="input-style w-full" autoFocus />
        </div>
        <div className="w-1/3">
          <label className="label-text">金額 (¥)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input-style w-full font-mono text-right" />
        </div>
      </div>

      <div>
        <label className="label-text mb-2 block">分類</label>
        <div className="flex justify-between space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c.id} type="button" onClick={() => setCategory(c.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] transition-all border-2
                ${category === c.id ? 'border-[#5C4033] bg-orange-50 scale-105' : 'border-transparent hover:bg-gray-50'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${c.color}`}>
                <FontAwesomeIcon icon={c.icon} />
              </div>
              <span className="text-[10px] font-bold text-gray-500">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3">
        <div className="flex items-center space-x-2">
           <label className="label-text w-16">付款人</label>
           <div className="flex-1 flex overflow-x-auto no-scrollbar space-x-2">
             {members.map(m => (
               <button
                 key={m} type="button" onClick={() => setPayer(m)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all
                   ${payer === m ? 'bg-[#5C4033] text-white border-[#5C4033]' : 'bg-white text-gray-500 border-gray-200'}`}
               >
                 {m}
               </button>
             ))}
           </div>
        </div>

        <div className="flex items-center space-x-2">
           <label className="label-text w-16">支付方式</label>
           <div className="flex-1 flex justify-between space-x-1">
             {PAYMENT_METHODS.map(m => (
               <button
                 key={m.id} type="button" onClick={() => setMethod(m.id)}
                 className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center border transition-all
                   ${method === m.id ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-400 border-gray-200'}`}
               >
                 <FontAwesomeIcon icon={m.icon} className="mb-0.5" />
                 {m.label}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div>
        <label className="label-text mb-1 block">分攤給誰 (平均分攤)</label>
        <div className="flex flex-wrap gap-2">
          {members.map(m => {
            const isSelected = involved.includes(m);
            return (
              <button
                key={m} type="button" onClick={() => toggleInvolved(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center space-x-1
                  ${isSelected ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-gray-300 border-gray-100'}`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-gray-200'}`} />
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="flex items-center justify-center w-8 text-gray-400"><FontAwesomeIcon icon={faLocationDot} /></div>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="地點 (選填，例如: 心齋橋)" className="input-style flex-1" />
        </div>
        
        <div className="flex space-x-2">
          <div className="flex items-center justify-center w-8 text-gray-400"><FontAwesomeIcon icon={faImage} /></div>
          <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="照片網址 (選填)" className="input-style flex-1 text-blue-500" />
          <button type="button" onClick={handleSearchImage} className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 rounded-xl">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
        {photoUrl && (
          <div className="h-24 w-full rounded-xl overflow-hidden bg-gray-100 ml-10 w-[calc(100%-2.5rem)]">
            <img src={photoUrl} alt="預覽" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        )}
      </div>

      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-style w-full" />

      <div className="pt-2 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-orange-100">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存</button>
      </div>

      <style>{`
        .label-text { font-size: 0.75rem; font-weight: 700; color: #9CA3AF; }
        .input-style { background: white; border: 2px solid #F3F4F6; border-radius: 0.75rem; padding: 0.5rem 1rem; font-weight: 700; color: #374151; outline: none; transition: all; }
        .input-style:focus { border-color: #FDBA74; }
      `}</style>
    </form>
  );
};