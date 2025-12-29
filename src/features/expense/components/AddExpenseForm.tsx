import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ▼▼▼ 修正：移除了沒用到的 faTrashCan ▼▼▼
import { 
  faUtensils, faTrainSubway, faBagShopping, faBed, faCamera, faEllipsis, 
  faUser, faCheck
} from '@fortawesome/free-solid-svg-icons';
import type { ExpenseItem } from './ExpenseCard';

const CATEGORIES = [
  { id: 'food', label: '飲食', icon: faUtensils, color: 'bg-orange-500' },
  { id: 'traffic', label: '交通', icon: faTrainSubway, color: 'bg-blue-500' },
  { id: 'shopping', label: '購物', icon: faBagShopping, color: 'bg-pink-500' },
  { id: 'hotel', label: '住宿', icon: faBed, color: 'bg-indigo-500' },
  { id: 'activity', label: '玩樂', icon: faCamera, color: 'bg-green-500' },
  { id: 'other', label: '其他', icon: faEllipsis, color: 'bg-gray-500' },
];

interface AddExpenseFormProps {
  initialData?: ExpenseItem | null;
  members: string[];
  onSubmit: (data: Omit<ExpenseItem, 'id'>) => void;
  onCancel: () => void;
}

export const AddExpenseForm = ({ initialData, members, onSubmit, onCancel }: AddExpenseFormProps) => {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'TWD' | 'JPY'>('JPY');
  const [category, setCategory] = useState('food');
  const [payer, setPayer] = useState(members[0]);
  const [involved, setInvolved] = useState<string[]>(members);

  useEffect(() => {
    if (initialData) {
      setItem(initialData.item);
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setCategory(initialData.category || 'food');
      setPayer(initialData.payer);
      setInvolved(initialData.involved || members);
    }
  }, [initialData, members]);

  const toggleInvolved = (member: string) => {
    if (involved.includes(member)) {
      setInvolved(involved.filter(m => m !== member));
    } else {
      setInvolved([...involved, member]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !amount) return;
    
    const finalInvolved = involved.length === 0 ? [payer] : involved;

    onSubmit({
      item,
      amount: Number(amount),
      currency,
      category,
      payer,
      involved: finalInvolved,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">分類</label>
        <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center space-y-1 min-w-[50px] transition-all
                ${category === cat.id ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'}`}
            >
              <div className={`w-10 h-10 rounded-full ${cat.color} text-white flex items-center justify-center shadow-sm`}>
                <FontAwesomeIcon icon={cat.icon} />
              </div>
              <span className="text-[10px] font-bold text-gray-500">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">項目名稱</label>
        <input 
          type="text" 
          value={item} 
          onChange={e => setItem(e.target.value)} 
          placeholder="例如：便利商店、計程車" 
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-[#5E5340] outline-none focus:border-orange-200"
        />
      </div>

      <div className="flex space-x-2">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 mb-1">金額</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0" 
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-xl text-[#5E5340] outline-none focus:border-orange-200 text-center font-mono"
          />
        </div>
        <div className="w-1/3">
          <label className="block text-xs font-bold text-gray-400 mb-1">幣別</label>
          <div className="flex bg-gray-100 rounded-xl p-1 h-[52px]">
            {['JPY', 'TWD'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c as 'JPY' | 'TWD')}
                className={`flex-1 rounded-lg text-xs font-bold transition-all ${currency === c ? 'bg-white shadow-sm text-[#5C4033]' : 'text-gray-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">誰先付錢？</label>
        <div className="flex flex-wrap gap-2">
          {members.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setPayer(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center
                ${payer === m 
                  ? 'bg-[#5C4033] text-white border-[#5C4033]' 
                  : 'bg-white text-gray-400 border-gray-100'}`}
            >
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">幫誰付的？(分攤者)</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInvolved(members)}
            className="px-3 py-2 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            全選
          </button>
          {members.map(m => {
            const isSelected = involved.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleInvolved(m)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center space-x-1
                  ${isSelected 
                    ? 'bg-orange-50 text-orange-600 border-orange-200' 
                    : 'bg-white text-gray-300 border-transparent'}`}
              >
                {isSelected && <FontAwesomeIcon icon={faCheck} />}
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-[#F2F4E7]">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存</button>
      </div>
    </form>
  );
};