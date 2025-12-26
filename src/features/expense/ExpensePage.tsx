import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUserGroup, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ExpenseCard, type ExpenseItem } from './components/ExpenseCard';
import { AddExpenseForm } from './components/AddExpenseForm';
import { Modal } from '../../components/ui/Modal';

const INITIAL_MEMBERS = ['我', '旅伴 A'];
const INITIAL_EXPENSES: ExpenseItem[] = [
  { 
    id: '1', title: '環球影城門票', amount: 18400, date: '2025-02-27', 
    payer: '我', involved: ['我', '旅伴 A'], 
    method: 'card', category: 'entertainment',
    location: 'USJ', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Universal_Globe.jpg/800px-Universal_Globe.jpg'
  }
];

export const ExpensePage = () => {
  const [members, setMembers] = useState<string[]>(() => {
    const saved = localStorage.getItem('travel-members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('travel-expenses-data');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => { localStorage.setItem('travel-members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('travel-expenses-data', JSON.stringify(expenses)); }, [expenses]);

  const calculateSummary = () => {
    const summary: Record<string, { paid: number; consumed: number }> = {};
    members.forEach(m => summary[m] = { paid: 0, consumed: 0 });

    expenses.forEach(item => {
      const amount = Number(item.amount);
      if (summary[item.payer || '我']) {
        summary[item.payer || '我'].paid += amount;
      }

      const targets = item.involved && item.involved.length > 0 ? item.involved : members;
      const splitAmount = amount / targets.length;

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
    if (editingItem) {
      setExpenses(prev => prev.map(item => item.id === editingItem.id ? { ...data, id: item.id } : item));
    } else {
      setExpenses(prev => [{ ...data, id: Date.now().toString() }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這筆帳目嗎？')) {
      setExpenses(prev => prev.filter(i => i.id !== id));
    }
  };

  const addMember = () => {
    if (newMemberName.trim() && !members.includes(newMemberName.trim())) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };
  const removeMember = (name: string) => {
    if (members.length <= 1) return alert('至少要有一個人喔！');
    if (confirm(`刪除成員「${name}」可能會影響已存在的帳目計算，確定嗎？`)) {
      setMembers(prev => prev.filter(m => m !== name));
    }
  };

  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="bg-[#5C4033] text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
           <div>
             <p className="text-xs font-bold opacity-70 mb-1">旅費總支出 (日幣)</p>
             <h2 className="text-4xl font-black font-mono">¥ {totalAmount.toLocaleString()}</h2>
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
              <div key={m} className="flex-shrink-0">
                <div className="text-[10px] opacity-70 mb-0.5">{m} 代墊</div>
                <div className="font-bold font-mono">¥ {Math.round(summary[m]?.paid || 0).toLocaleString()}</div>
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "編輯帳目" : "新增帳目"}
      >
        <AddExpenseForm 
          initialData={editingItem}
          members={members}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="管理成員"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 p-3 rounded-xl text-xs text-[#5C4033]">
             💡 這裡設定的人名，會在記帳時用來選擇「誰付錢」和「幫誰付錢」。
          </div>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              placeholder="輸入名字 (例如: 媽媽)"
              className="flex-1 bg-gray-50 border-2 border-transparent focus:border-orange-300 rounded-xl px-4 py-2 outline-none font-bold text-gray-700"
            />
            <button onClick={addMember} className="bg-[#5C4033] text-white px-4 rounded-xl font-bold">新增</button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {members.map(m => (
              <div key={m} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl">
                <span className="font-bold text-gray-700">{m}</span>
                <button onClick={() => removeMember(m)} className="text-gray-300 hover:text-red-400 p-2">
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};