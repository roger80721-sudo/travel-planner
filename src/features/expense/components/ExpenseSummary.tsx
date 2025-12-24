import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPen, faRotate, faCloudArrowDown, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

interface SummaryProps {
  totalSpent: number;
  budget: number;
  rate: number;
  isUpdating: boolean; // 新增：是否正在更新中
  onUpdateBudget: (newBudget: number) => void;
  onUpdateRate: (newRate: number) => void;
  onAutoUpdateRate: () => void; // 新增：自動更新的函式
}

export const ExpenseSummary = ({ 
  totalSpent, budget, rate, isUpdating, 
  onUpdateBudget, onUpdateRate, onAutoUpdateRate 
}: SummaryProps) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempVal, setTempVal] = useState('');

  const startEdit = (type: 'budget' | 'rate', currentVal: number) => {
    setTempVal(currentVal.toString());
    if (type === 'budget') setIsEditingBudget(true);
    else setIsEditingRate(true);
  };

  const saveBudget = () => {
    const val = parseInt(tempVal);
    if (!isNaN(val) && val > 0) onUpdateBudget(val);
    setIsEditingBudget(false);
  };

  const saveRate = () => {
    const val = parseFloat(tempVal);
    if (!isNaN(val) && val > 0) onUpdateRate(val);
    setIsEditingRate(false);
  };

  const percent = Math.min(100, Math.round((totalSpent / budget) * 100));
  const remain = budget - totalSpent;

  return (
    <div className="bg-[#5C4033] text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          {/* 左：預算設定 */}
          <div>
            <div className="flex items-center space-x-2 opacity-80 mb-1">
              <FontAwesomeIcon icon={faWallet} />
              <span className="text-xs font-bold tracking-widest">總預算 (TWD)</span>
            </div>
            {isEditingBudget ? (
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={tempVal}
                  onChange={e => setTempVal(e.target.value)}
                  className="w-24 text-black rounded px-1 text-sm font-bold outline-none"
                  autoFocus
                  onBlur={saveBudget}
                />
              </div>
            ) : (
              <button onClick={() => startEdit('budget', budget)} className="flex items-center space-x-2 hover:opacity-80">
                <span className="font-mono font-bold text-lg">${budget.toLocaleString()}</span>
                <FontAwesomeIcon icon={faPen} className="text-xs opacity-50" />
              </button>
            )}
          </div>

          {/* 右：匯率設定 */}
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold opacity-60 mb-1">目前匯率 (JPY → TWD)</span>
             
             <div className="flex items-center space-x-2">
               {/* 自動更新按鈕 */}
               <button 
                 onClick={onAutoUpdateRate}
                 disabled={isUpdating}
                 className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
                 title="從網路更新匯率"
               >
                 <FontAwesomeIcon 
                   icon={isUpdating ? faCircleNotch : faCloudArrowDown} 
                   className={`text-xs ${isUpdating ? 'animate-spin' : ''}`} 
                 />
               </button>

               {/* 手動修改 */}
               {isEditingRate ? (
                 <input 
                   type="number" 
                   step="0.001"
                   value={tempVal}
                   onChange={e => setTempVal(e.target.value)}
                   className="w-16 text-right text-black rounded px-1 text-sm font-bold outline-none"
                   autoFocus
                   onBlur={saveRate}
                 />
               ) : (
                 <button 
                   onClick={() => startEdit('rate', rate)}
                   className="bg-black/20 px-2 py-1 rounded-lg flex items-center space-x-1 hover:bg-black/30 transition-colors"
                 >
                   <FontAwesomeIcon icon={faRotate} className="text-xs opacity-70" />
                   <span className="font-mono font-bold text-sm">{rate}</span>
                 </button>
               )}
             </div>
          </div>
        </div>

        <div className="text-center py-2">
          <span className="text-sm opacity-60 block mb-1">目前總花費</span>
          <div className="text-5xl font-black font-mono tracking-tighter">
            ${totalSpent.toLocaleString()}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-xs font-bold opacity-60 mb-1">
            <span>剩餘: ${remain.toLocaleString()}</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                percent > 90 ? 'bg-red-400' : percent > 50 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};