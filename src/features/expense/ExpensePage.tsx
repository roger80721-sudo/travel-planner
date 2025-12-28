import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faUserGroup, faTrashCan, faCoins, faArrowsRotate, 
  faCloudArrowDown, faPalette 
} from '@fortawesome/free-solid-svg-icons';
import { ExpenseCard, type ExpenseItem } from './components/ExpenseCard';
import { AddExpenseForm } from './components/AddExpenseForm';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

// 動森風格色票
const COLOR_PALETTE = [
  '#F3A76C', // 橘
  '#7CAFC4', // 藍
  '#F5E050', // 黃
  '#96E0C5', // 綠
  '#F48FB1', // 粉
  '#9575CD', // 紫
  '#4DB6AC', // 青
  '#BCAAA4', // 灰
];

const INITIAL_MEMBERS = ['我', '旅伴 A'];
const INITIAL_EXPENSES: ExpenseItem[] = [];

export const ExpensePage = () => {
  const [members, setMembers] = useState<string[]>(INITIAL_MEMBERS);
  // 新增：成員顏色對照表 { "我": "#F3A76C", ... }
  const [memberColors, setMemberColors] = useState<Record<string, string>>({});
  
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [exchangeRate, setExchangeRate] = useState<number>(0.22);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  
  // 新增成員表單狀態
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const cloudMembers = await loadFromCloud('travel-members');
      if (cloudMembers) setMembers(cloudMembers);

      // 載入顏色
      const cloudColors = await loadFromCloud('travel-member-colors');
      if (cloudColors) {
        setMemberColors(cloudColors);
      } else {
        // 如果雲端沒顏色資料，給現有成員隨機上色
        const defaultColors: Record<string, string> = {};
        (cloudMembers || INITIAL_MEMBERS).forEach((m: string, index: number) => {
          defaultColors[m] = COLOR_PALETTE[index % COLOR_PALETTE.length];
        });
        setMemberColors(defaultColors);
      }

      const cloudExpenses = await loadFromCloud('travel-expenses-data');
      if (cloudExpenses) setExpenses(cloudExpenses);

      const cloudRate = await loadFromCloud('travel-exchange-rate');
      if (cloudRate) setExchangeRate(Number(cloudRate));

      setIsLoading(false);
    };
    initData();
  }, []);

  const saveExpensesToCloud = (newData: ExpenseItem[]) => {
    setExpenses(newData);
    saveToCloud('travel-expenses-data', newData);
  };
  
  // 儲存成員與顏色
  const saveMembersToCloud = (newMembers: string[], newColors: Record<string, string>) => {
    setMembers(newMembers);
    setMemberColors(newColors);
    saveToCloud('travel-members', newMembers);
    saveToCloud('travel-member-colors', newColors);
  };

  const saveRateToCloud = (newRate: number) => {
    setExchangeRate(newRate);
    saveToCloud('travel-exchange-rate', newRate);
  };

  const handleRefreshRate = async () => {
    setIsUpdatingRate(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      const data = await response.json();
      const newRate = data.rates.TWD;
      if (newRate) {
        saveRateToCloud(newRate);
        alert(`匯率更新成功！\n目前 1 JPY ≈ ${newRate} TWD`);
      }
    } catch (error) {
      alert('匯率更新失敗');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const calculateSummary = () => {
    const summary: Record<string, { paid: number; consumed: number }> = {};
    members.forEach(m => summary[m] = { paid: 0, consumed: 0 });

    expenses.forEach(item => {
      const amountTWD = item.currency === 'JPY' ? item.amount * exchangeRate : item.amount;
      if (summary[item.payer || '我']) {
        summary[item.payer || '我'].paid += amountTWD;
      }
      const targets = item.involved && item.involved.length > 0 ? item.involved : members;
      const splitAmount = amountTWD / targets.length;
      targets.forEach(member => {
        if (summary[member]) {
          summary[member].consumed += splitAmount;
        }
      });
    });
    return summary;
  };
  const summary = calculateSummary();

  const handleSave = (data: Omit<ExpenseItem, 'id'>) => {
    let newExpenses;
    if (editingItem) {
      newExpenses = expenses.map(item => item.id === editingItem.id ? { ...data, id: item.id } : item);
    } else {
      newExpenses = [{ ...data, id: Date.now().toString() }, ...expenses];
    }
    saveExpensesToCloud(newExpenses);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這筆帳目嗎？')) {
      const newExpenses = expenses.filter(i => i.id !== id);
      saveExpensesToCloud(newExpenses);
    }
  };

  const addMember = () => {
    const name = newMemberName.trim();
    if (name && !members.includes(name)) {
      const newMembers = [...members, name];
      const newColors = { ...memberColors, [name]: newMemberColor };
      
      saveMembersToCloud(newMembers, newColors);
      setNewMemberName('');
      // 自動切換到下一個顏色
      const nextColorIndex = (COLOR_PALETTE.indexOf(newMemberColor) + 1) % COLOR_PALETTE.length;
      setNewMemberColor(COLOR_PALETTE[nextColorIndex]);
    }
  };

  const removeMember = (name: string) => {
    if (members.length <= 1) return alert('至少要有一個人喔！');
    if (confirm(`刪除成員「${name}」可能會影響已存在的帳目計算，確定嗎？`)) {
      const newMembers = members.filter(m => m !== name);
      // 顏色不用特別刪，留著也沒關係，或是刪除也可以
      const newColors = { ...memberColors };
      delete newColors[name];
      
      saveMembersToCloud(newMembers, newColors);
    }
  };

  const totalAmountTWD = expenses.reduce((sum, item) => {
    return sum + (item.currency === 'JPY' ? item.amount * exchangeRate : item.amount);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在從雲端載入帳本...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="bg-[#5C4033] text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
           <div>
             <p className="text-xs font-bold opacity-70 mb-1">旅費總支出 (約台幣)</p>
             <h2 className="text-4xl font-black font-mono">NT$ {Math.round(totalAmountTWD).toLocaleString()}</h2>
             
             <div className="flex items-center space-x-2 mt-2 bg-black/20 w-fit px-2 py-1 rounded-lg">
                <FontAwesomeIcon icon={faCoins} className="text-xs text-orange-200" />
                <span className="text-[10px] font-bold">匯率 0.</span>
                <input 
                  type="number" 
                  value={Math.round(exchangeRate * 1000)}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     saveRateToCloud(val > 10 ? val / 1000 : val / 100);
                  }}
                  className="w-8 bg-transparent text-[10px] font-mono font-bold text-center outline-none border-b border-white/30 focus:border-white"
                />
                <button 
                  onClick={handleRefreshRate}
                  disabled={isUpdatingRate}
                  className={`ml-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all ${isUpdatingRate ? 'animate-spin' : ''}`}
                >
                  <FontAwesomeIcon icon={faArrowsRotate} className="text-[10px]" />
                </button>
             </div>
           </div>
           
           <button 
             onClick={() => setIsMemberModalOpen(true)}
             className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-colors"
           >
             <FontAwesomeIcon icon={faUserGroup} />
           </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            {members.map(m => (
              <div key={m} className="flex-shrink-0 flex items-center space-x-2 bg-black/10 px-3 py-1.5 rounded-xl">
                {/* 顯示成員顏色頭像 */}
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/50 shadow-sm"
                  style={{ backgroundColor: memberColors[m] || '#fff' }}
                />
                <div>
                  <div className="text-[10px] opacity-70 mb-0.5">{m} 代墊</div>
                  <div className="font-bold font-mono text-sm">NT$ {Math.round(summary[m]?.paid || 0).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map(item => (
          <ExpenseCard 
            key={item.id} 
            item={item} 
            exchangeRate={exchangeRate}
            memberColors={memberColors} // 傳入顏色表
            onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <button 
        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "編輯帳目" : "新增帳目"}>
        <AddExpenseForm initialData={editingItem} members={members} onSubmit={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* 成員管理 Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="管理成員與代表色">
        <div className="space-y-4">
          <div className="bg-orange-50 p-3 rounded-xl text-xs text-[#5C4033]">
             💡 為每位成員設定一個代表色，分帳時更清楚喔！
          </div>
          
          {/* 新增成員區塊 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
               <input 
                 type="text" 
                 value={newMemberName} 
                 onChange={e => setNewMemberName(e.target.value)} 
                 placeholder="輸入名字" 
                 className="flex-1 input-style" 
               />
               <button onClick={addMember} className="bg-[#5C4033] text-white px-4 py-2 rounded-xl font-bold whitespace-nowrap">
                 新增
               </button>
            </div>
            
            {/* 顏色選擇器 */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
               <span className="text-xs font-bold text-gray-400 whitespace-nowrap"><FontAwesomeIcon icon={faPalette} /> 代表色：</span>
               {COLOR_PALETTE.map(color => (
                 <button
                   key={color}
                   onClick={() => setNewMemberColor(color)}
                   className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-transform ${newMemberColor === color ? 'border-gray-500 scale-125' : 'border-white'}`}
                   style={{ backgroundColor: color }}
                 />
               ))}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 my-2" />

          {/* 成員列表 */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {members.map(m => (
              <div key={m} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: memberColors[m] || '#eee' }}
                  />
                  <span className="font-bold text-gray-700">{m}</span>
                </div>
                <button onClick={() => removeMember(m)} className="text-gray-300 hover:text-red-400 p-2">
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <style>{`
        .input-style { background: white; border: 2px solid #F3F4F6; border-radius: 0.75rem; padding: 0.5rem 1rem; font-weight: 700; color: #5E5340; outline: none; }
        .input-style:focus { border-color: #FDBA74; }
      `}</style>
    </div>
  );
};