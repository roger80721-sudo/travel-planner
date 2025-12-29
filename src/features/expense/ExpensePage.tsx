import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faUserGroup, faTrashCan, faCoins, faArrowsRotate, 
  faCloudArrowDown, faPalette, faChartPie, faList, faMoneyBillTransfer, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { ExpenseCard, type ExpenseItem } from './components/ExpenseCard';
import { AddExpenseForm } from './components/AddExpenseForm';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

// 分類設定
const CAT_LABELS: Record<string, string> = {
  food: '飲食', traffic: '交通', shopping: '購物', hotel: '住宿', activity: '玩樂', other: '其他'
};
const CAT_COLORS: Record<string, string> = {
  food: '#F97316', traffic: '#3B82F6', shopping: '#EC4899', hotel: '#6366F1', activity: '#22C55E', other: '#6B7280'
};

const COLOR_PALETTE = [
  '#F3A76C', '#7CAFC4', '#F5E050', '#96E0C5', '#F48FB1', '#9575CD', '#4DB6AC', '#BCAAA4'
];

const INITIAL_MEMBERS = ['我', '旅伴 A'];
const INITIAL_EXPENSES: ExpenseItem[] = [];

export const ExpensePage = () => {
  const [members, setMembers] = useState<string[]>(INITIAL_MEMBERS);
  const [memberColors, setMemberColors] = useState<Record<string, string>>({});
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [exchangeRate, setExchangeRate] = useState<number>(0.22);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // 新增：結算 Modal
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  
  const [viewingMember, setViewingMember] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const cloudMembers = await loadFromCloud('travel-members');
      if (cloudMembers) setMembers(cloudMembers);

      const cloudColors = await loadFromCloud('travel-member-colors');
      if (cloudColors) {
        setMemberColors(cloudColors);
      } else {
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

  // ▼▼▼ 核心演算法：計算結算路徑 ▼▼▼
  const calculateSettlements = () => {
    // 1. 計算每個人的淨餘額 (正 = 應收, 負 = 應付)
    const balances: Record<string, number> = {};
    members.forEach(m => {
      // 淨餘額 = 已付總額 - 應付總額
      balances[m] = (summary[m]?.paid || 0) - (summary[m]?.consumed || 0);
    });

    // 2. 分類為「債務人(欠錢)」與「債權人(收錢)」
    let debtors: { name: string; amount: number }[] = [];
    let creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, amount]) => {
      if (amount < -1) debtors.push({ name, amount }); // 忽略極小誤差
      else if (amount > 1) creditors.push({ name, amount });
    });

    // 排序：金額大的優先處理 (貪婪演算法)
    debtors.sort((a, b) => a.amount - b.amount); // 負越多的排前面
    creditors.sort((a, b) => b.amount - a.amount); // 正越多的排前面

    const transactions: { from: string; to: string; amount: number }[] = [];

    // 3. 雙指針配對
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // 取兩者絕對值的最小值 (能還多少就還多少)
      const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount)
      });

      // 更新餘額
      debtor.amount += amount;
      creditor.amount -= amount;

      // 如果債務人還清了，換下一個
      if (Math.abs(debtor.amount) < 1) i++;
      // 如果債權人收滿了，換下一個
      if (creditor.amount < 1) j++;
    }

    return { balances, transactions };
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

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
      const nextColorIndex = (COLOR_PALETTE.indexOf(newMemberColor) + 1) % COLOR_PALETTE.length;
      setNewMemberColor(COLOR_PALETTE[nextColorIndex]);
    }
  };

  const removeMember = (name: string) => {
    if (members.length <= 1) return alert('至少要有一個人喔！');
    if (confirm(`刪除成員「${name}」可能會影響已存在的帳目計算，確定嗎？`)) {
      const newMembers = members.filter(m => m !== name);
      const newColors = { ...memberColors };
      delete newColors[name];
      saveMembersToCloud(newMembers, newColors);
    }
  };

  const getMemberDetails = (member: string) => {
    const paidItems = expenses.filter(e => e.payer === member);
    const totalPaid = paidItems.reduce((sum, item) => sum + (item.currency === 'JPY' ? item.amount * exchangeRate : item.amount), 0);
    const categoryStats: Record<string, number> = {};
    paidItems.forEach(item => {
      const cat = item.category || 'other';
      const val = item.currency === 'JPY' ? item.amount * exchangeRate : item.amount;
      categoryStats[cat] = (categoryStats[cat] || 0) + val;
    });
    return { paidItems, totalPaid, categoryStats };
  };

  const openMemberDetail = (member: string) => {
    setViewingMember(member);
    setIsDetailModalOpen(true);
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
           
           <div className="flex flex-col space-y-2">
             <button 
               onClick={() => setIsMemberModalOpen(true)}
               className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-colors"
             >
               <FontAwesomeIcon icon={faUserGroup} />
             </button>
             {/* ▼▼▼ 結算按鈕 ▼▼▼ */}
             <button 
               onClick={() => setIsSettlementModalOpen(true)}
               className="bg-orange-400 hover:bg-orange-500 text-white p-2 rounded-xl shadow-lg transition-colors flex items-center justify-center"
               title="結算建議"
             >
               <FontAwesomeIcon icon={faMoneyBillTransfer} />
             </button>
           </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-[10px] opacity-60 mb-2 font-bold">點擊頭像查看詳細分類 👇</p>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            {members.map(m => (
              <div 
                key={m} 
                onClick={() => openMemberDetail(m)}
                className="flex-shrink-0 flex items-center space-x-2 bg-black/10 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-black/20 transition-colors"
              >
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
            memberColors={memberColors} 
            onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
            onDelete={handleDelete}
          />
        ))}
        {expenses.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-bold opacity-50">
            還沒有記帳喔！按右下角 + 新增
          </div>
        )}
      </div>

      <button 
        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* 新增/編輯 Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "編輯帳目" : "新增帳目"}>
        <AddExpenseForm initialData={editingItem} members={members} onSubmit={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* 成員管理 Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="管理成員與代表色">
        <div className="space-y-4">
          <div className="bg-orange-50 p-3 rounded-xl text-xs text-[#5C4033]">
             💡 為每位成員設定一個代表色，分帳時更清楚喔！
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
               <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="輸入名字" className="flex-1 input-style" />
               <button onClick={addMember} className="bg-[#5C4033] text-white px-4 py-2 rounded-xl font-bold whitespace-nowrap">新增</button>
            </div>
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
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {members.map(m => (
              <div key={m} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: memberColors[m] || '#eee' }} />
                  <span className="font-bold text-gray-700">{m}</span>
                </div>
                <button onClick={() => removeMember(m)} className="text-gray-300 hover:text-red-400 p-2"><FontAwesomeIcon icon={faTrashCan} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 個人詳細分析 Modal */}
      {viewingMember && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`${viewingMember} 的代墊分析`}>
          {(() => {
            const { paidItems, totalPaid, categoryStats } = getMemberDetails(viewingMember);
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400 font-bold mb-1">總代墊金額 (NT$)</div>
                  <div className="text-4xl font-black text-[#5E5340] font-mono">{Math.round(totalPaid).toLocaleString()}</div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-500 mb-2 flex items-center"><FontAwesomeIcon icon={faChartPie} className="mr-2" /> 分類統計</h4>
                  <div className="space-y-2">
                    {Object.entries(categoryStats).map(([cat, amount]) => {
                      const percent = (amount / totalPaid) * 100;
                      return (
                        <div key={cat} className="flex items-center space-x-2">
                          <div className="w-20 text-xs font-bold text-gray-500 text-right">{CAT_LABELS[cat]}</div>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: CAT_COLORS[cat] || '#ccc' }} />
                          </div>
                          <div className="w-16 text-xs font-mono font-bold text-right">${Math.round(amount).toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-500 mb-2 flex items-center"><FontAwesomeIcon icon={faList} className="mr-2" /> 帳目明細</h4>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto bg-gray-50 p-2 rounded-xl">
                    {paidItems.length === 0 ? <div className="text-center text-xs text-gray-400 py-4">沒有資料</div> : 
                      paidItems.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[item.category || 'other'] }} />
                            <span className="font-bold text-gray-700">{item.item}</span>
                          </div>
                          <div className="font-mono font-bold text-gray-500">{item.currency === 'JPY' ? `¥${item.amount}` : `$${item.amount}`}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ▼▼▼ 結算建議 Modal ▼▼▼ */}
      <Modal isOpen={isSettlementModalOpen} onClose={() => setIsSettlementModalOpen(false)} title="💰 結算建議 (NT$)">
        {(() => {
          const { balances, transactions } = calculateSettlements();
          return (
            <div className="space-y-6">
              {/* 1. 收支一覽 (長條圖) */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faList} className="mr-2" /> 目前收支一覽
                </h4>
                <div className="space-y-3">
                  {Object.entries(balances).map(([member, amount]) => {
                    const isPositive = amount > 0;
                    return (
                      <div key={member} className="flex items-center text-xs font-bold">
                        <div className="w-16 text-right mr-2 text-gray-600">{member}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-md relative flex items-center">
                          {/* 0 的中線 */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 z-10"></div>
                          
                          {/* 負值條 (向左) */}
                          {!isPositive && (
                            <div 
                              className="absolute right-1/2 top-1 bottom-1 bg-red-400 rounded-l-sm transition-all" 
                              style={{ width: `${Math.min(Math.abs(amount) / 2000 * 50, 50)}%` }} // 簡單縮放，假設2000是長條極限
                            />
                          )}
                          
                          {/* 正值條 (向右) */}
                          {isPositive && (
                            <div 
                              className="absolute left-1/2 top-1 bottom-1 bg-green-400 rounded-r-sm transition-all" 
                              style={{ width: `${Math.min(amount / 2000 * 50, 50)}%` }}
                            />
                          )}
                        </div>
                        <div className={`w-20 text-right ml-2 font-mono ${isPositive ? 'text-green-600' : amount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {amount > 0 ? '+' : ''}{Math.round(amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  <span className="text-green-500">綠色</span> = 應收 (多付了) / <span className="text-red-500">紅色</span> = 應付 (少付了)
                </p>
              </div>

              {/* 2. 轉帳建議 */}
              <div className="bg-[#FFF8E1] border-2 border-[#FFE0B2] rounded-2xl p-4">
                <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faMoneyBillTransfer} className="mr-2" /> 最佳轉帳路徑
                </h4>
                {transactions.length === 0 ? (
                  <div className="text-center text-gray-400 font-bold py-2">🎉 帳目已平衡，不需要轉帳！</div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-gray-600">{t.from}</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-orange-300 text-xs" />
                          <span className="font-black text-gray-600">{t.to}</span>
                        </div>
                        <div className="font-black text-orange-600 font-mono text-lg">
                          ${t.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <style>{`
        .input-style { background: white; border: 2px solid #F3F4F6; border-radius: 0.75rem; padding: 0.5rem 1rem; font-weight: 700; color: #5E5340; outline: none; }
        .input-style:focus { border-color: #FDBA74; }
      `}</style>
    </div>
  );
};