import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBagShopping, faTrain, faTicket, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import type { ExpenseRecord } from './ExpenseItem';

const CATEGORIES = [
  { value: 'food',      label: '餐飲', icon: faUtensils,    color: 'bg-red-100 text-red-500' },
  { value: 'shopping',  label: '購物', icon: faBagShopping, color: 'bg-yellow-100 text-yellow-600' },
  { value: 'transport', label: '交通', icon: faTrain,       color: 'bg-blue-100 text-blue-500' },
  { value: 'ticket',    label: '門票', icon: faTicket,      color: 'bg-purple-100 text-purple-500' },
  { value: 'other',     label: '其他', icon: faEllipsis,    color: 'bg-gray-100 text-gray-500' },
];

interface AddFormProps {
  currentRate: number; // 接收目前的匯率
  onSubmit: (item: Omit<ExpenseRecord, 'id'>) => void;
  onCancel: () => void;
}

export const AddExpenseForm = ({ currentRate, onSubmit, onCancel }: AddFormProps) => {
  const [inputValue, setInputValue] = useState(''); // 使用者輸入的數字
  const [currency, setCurrency] = useState<'JPY' | 'TWD'>('JPY'); // 預設用日幣記帳 (去日本玩嘛)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  // 計算換算結果
  const displayAmount = inputValue ? parseInt(inputValue) : 0;
  const convertedAmount = currency === 'JPY' 
    ? Math.round(displayAmount * currentRate) 
    : displayAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || !title) return;

    onSubmit({
      title,
      amount: convertedAmount, // 存入台幣 (方便統計)
      originalAmount: currency === 'JPY' ? displayAmount : undefined, // 如果是日幣，存入原價
      currency,
      category: category as any,
      date,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 幣別切換器 */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-xl flex space-x-1">
          <button
            type="button"
            onClick={() => setCurrency('JPY')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              currency === 'JPY' ? 'bg-white shadow text-[#5C4033]' : 'text-gray-400'
            }`}
          >
            日幣 (¥)
          </button>
          <button
            type="button"
            onClick={() => setCurrency('TWD')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              currency === 'TWD' ? 'bg-white shadow text-[#5C4033]' : 'text-gray-400'
            }`}
          >
            台幣 ($)
          </button>
        </div>
      </div>

      {/* 金額輸入 */}
      <div className="text-center relative">
        <label className="block text-xs font-bold text-gray-400 mb-2">
          金額 ({currency})
        </label>
        <input 
          type="number" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="0"
          autoFocus
          className="w-full text-center text-5xl font-black text-[#5C4033] bg-transparent outline-none placeholder-gray-200"
        />
        
        {/* 自動換算提示 */}
        {currency === 'JPY' && inputValue && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-gray-400 bg-gray-50 py-1 px-3 rounded-full inline-flex mx-auto">
            <span className="text-xs font-bold">約 NT$ {convertedAmount.toLocaleString()}</span>
            <span className="text-[10px] bg-gray-200 px-1 rounded">匯率 {currentRate}</span>
          </div>
        )}
      </div>

      {/* 分類選擇 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2 text-center">消費類型</label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all
                ${category === cat.value ? 'bg-[#5C4033] text-white shadow-lg scale-110' : 'bg-gray-50 text-gray-400'}`}
            >
              <FontAwesomeIcon icon={cat.icon} className="text-lg mb-1" />
              <span className="text-[10px] font-bold">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 細項輸入 */}
      <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">品項名稱</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：章魚燒"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold text-gray-700 outline-none focus:border-orange-300"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">日期</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold text-gray-700 outline-none"
          />
        </div>
      </div>

      {/* 按鈕 */}
      <div className="flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-gray-100">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">記帳</button>
      </div>
    </form>
  );
};