import { useState, useEffect, useRef } from 'react'; // 1. 新增 useRef
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, faTrainSubway, faBagShopping, faBed, faCamera, faEllipsis, 
  faUser, faCheck, faSpinner, // 2. 新增 faSpinner
} from '@fortawesome/free-solid-svg-icons';
import type { ExpenseItem } from './ExpenseCard';
import { parseReceipt } from '../../../utils/ai'; // 3. 引入 AI 工具 (請確認路徑正確)

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
  
  // ▼▼▼ 新增的功能 State ▼▼▼
  // ✅ 修改後：如果有 initialData，就讀取裡面的 note，否則為空
  const [note, setNote] = useState(initialData?.note || ''); // 用來放翻譯明細
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // 開放日期編輯
  const [isAnalyzing, setIsAnalyzing] = useState(false); // AI 讀取狀態
  const fileInputRef = useRef<HTMLInputElement>(null); // 隱藏的檔案上傳輸入框

  useEffect(() => {
    if (initialData) {
      setItem(initialData.item);
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setCategory(initialData.category || 'food');
      setPayer(initialData.payer);
      setInvolved(initialData.involved || members);
      // 如果你的 ExpenseItem 有 note 欄位，記得這裡也要讀取
      setNote(initialData.note || ''); 
      setDate(initialData.date);
    }
  }, [initialData, members]);

  // ▼▼▼ 新增：處理圖片上傳與 AI 分析 ▼▼▼
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const result = await parseReceipt(file); // 呼叫 Gemini AI
      if (result) {
        // 1. 自動填入店家名稱
        setItem(result.storeName);
        
        // 2. 自動填入金額
        setAmount(result.totalAmount.toString());
        
        // 3. 組合「輸入時間」與「明細」到備註
        const inputTime = new Date().toLocaleString('zh-TW', { hour12: false });
        const noteContent = `【輸入時間】${inputTime}\n\n【明細清單】\n${result.items}`;
        setNote(noteContent);
        
        // 如果偵測到金額很大，或許可以自動切換成 "shopping" (選做)
        if (result.totalAmount > 5000) setCategory('shopping');

        alert(`✅ 辨識成功：${result.storeName}`);
      } else {
        alert('⚠️ 無法辨識內容，請重試');
      }
    } catch (error) {
      console.error(error);
      alert('❌ AI 分析發生錯誤');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // 重置 input 讓同一張圖可再選
    }
  };

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
      date: date, // 使用 State 的日期
      note: note, // ★ 注意：請確認你的 ExpenseItem type 裡面有定義 note，如果沒有要加上去
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-32">
      
      {/* ▼▼▼ 新增區塊：AI 智慧記帳按鈕 ▼▼▼ */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-gray-400">新增支出</h3>
        
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm
            ${isAnalyzing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-md active:scale-95'
            }`}
        >
          {isAnalyzing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              分析中...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCamera} />
              AI 掃描帶入
            </>
          )}
        </button>
      </div>

      {/* 分類選擇 (維持原樣) */}
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

      {/* 項目名稱 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">項目名稱</label>
        <div className="relative">
           <input 
             type="text" 
             value={item} 
             onChange={e => setItem(e.target.value)} 
             placeholder="例如：便利商店、計程車" 
             className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-[#5E5340] outline-none focus:border-orange-200 transition-colors"
           />
           {/* 如果 AI 自動填入，顯示一個小圖示提示 */}
           {item && isAnalyzing === false && note !== '' && (
             <div className="absolute right-3 top-3 text-green-500 animate-pulse">
               <FontAwesomeIcon icon={faCheck} />
             </div>
           )}
        </div>
      </div>

      {/* 金額與幣別 */}
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
      
      {/* 日期 (新增功能：讓使用者可以確認日期) */}
      <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-[#5E5340] outline-none focus:border-orange-200"
          />
      </div>

      {/* 誰先付錢？ (維持原樣) */}
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

      {/* 分攤者 (維持原樣) */}
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
      
      {/* ▼▼▼ 新增區塊：備註與明細 ▼▼▼ */}
      <div>
        <label className="flex justify-between items-center text-xs font-bold text-gray-400 mb-1">
            <span>備註 / 明細</span>
            {/* 如果有內容，顯示一個小提示 */}
            {note && <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">AI 已自動填寫</span>}
        </label>
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="備註事項..."
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-[#5E5340] outline-none focus:border-orange-200 h-32 leading-relaxed resize-none"
        />
      </div>

      {/* 按鈕區 (維持原樣) */}
      <div className="pt-4 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-[#F2F4E7]">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存</button>
      </div>
    </form>
  );
};