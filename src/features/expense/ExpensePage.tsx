import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ExpenseSummary } from './components/ExpenseSummary';
import { ExpenseItem, type ExpenseRecord } from './components/ExpenseItem';
import { AddExpenseForm } from './components/AddExpenseForm';
import { Modal } from '../../components/ui/Modal';

export const ExpensePage = () => {
  // 1. 讀取花費紀錄
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('travel-expenses-data');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. 讀取預算
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('travel-budget');
    return saved ? parseInt(saved) : 50000;
  });

  // 3. 讀取匯率
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('travel-exchange-rate');
    return saved ? parseFloat(saved) : 0.215;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false); // 新增：是否正在更新匯率

  // 自動存檔
  useEffect(() => { localStorage.setItem('travel-expenses-data', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('travel-budget', budget.toString()); }, [budget]);
  useEffect(() => { localStorage.setItem('travel-exchange-rate', exchangeRate.toString()); }, [exchangeRate]);

  // ▼▼▼ API 串接邏輯 ▼▼▼
  const fetchLatestRate = async () => {
    setIsUpdatingRate(true);
    try {
      // 使用 ExchangeRate-API (Base: JPY)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      const data = await response.json();
      
      // 取得 TWD 的匯率
      const newRate = data.rates.TWD;
      
      if (newRate) {
        setExchangeRate(newRate);
        alert(`匯率更新成功！\n目前 1 日圓 = ${newRate} 台幣`);
      } else {
        throw new Error('找不到台幣匯率');
      }
    } catch (error) {
      alert('更新失敗，請檢查網路連線');
      console.error(error);
    } finally {
      setIsUpdatingRate(false);
    }
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  // 計算總花費
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = (record: Omit<ExpenseRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    setExpenses(prev => [newRecord, ...prev]); 
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      setExpenses(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 總覽卡片 */}
      <ExpenseSummary 
        totalSpent={totalSpent} 
        budget={budget} 
        rate={exchangeRate}
        isUpdating={isUpdatingRate} // 傳入更新狀態
        onUpdateBudget={setBudget}
        onUpdateRate={setExchangeRate}
        onAutoUpdateRate={fetchLatestRate} // 傳入更新函式
      />

      {/* 紀錄列表標題 */}
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-xl font-bold text-[#5C4033]">消費紀錄</h3>
        <span className="text-xs text-gray-400 font-bold">{expenses.length} 筆資料</span>
      </div>

      {/* 列表 */}
      <div className="space-y-1">
        {expenses.length > 0 ? (
          expenses.map(item => (
            <ExpenseItem 
              key={item.id} 
              item={item} 
              onLongPress={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 opacity-40">
            <div className="text-4xl mb-2">💸</div>
            <p className="text-sm font-bold">還沒有花費，錢包滿滿的！</p>
          </div>
        )}
      </div>

      {/* 記帳按鈕 */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="記一筆"
      >
        <AddExpenseForm 
          currentRate={exchangeRate} 
          onSubmit={handleAddExpense}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};