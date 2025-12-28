import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen, faUser } from '@fortawesome/free-solid-svg-icons';

export interface ExpenseItem {
  id: string;
  item: string;
  amount: number;
  currency: 'TWD' | 'JPY';
  payer: string;
  involved: string[];
  date: string;
}

interface ExpenseCardProps {
  item: ExpenseItem;
  exchangeRate: number;
  memberColors: Record<string, string>; // 新增：接收成員顏色表
  onEdit: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

export const ExpenseCard = ({ item, exchangeRate, memberColors, onEdit, onDelete }: ExpenseCardProps) => {
  const amountTWD = item.currency === 'JPY' ? Math.round(item.amount * exchangeRate) : item.amount;
  
  // 判斷是誰參與 (如果 involved 是空的，代表是全體或個人，這邊依賴上層邏輯，通常 involved 至少會有 payer)
  // 這裡我們假設 involved 如果存在就顯示，不存在就顯示 "全體"
  const involvedMembers = item.involved && item.involved.length > 0 ? item.involved : [item.payer];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] flex justify-between items-center group relative">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-black text-[#5E5340] text-lg">{item.item}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.currency === 'JPY' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {item.currency}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-1 opacity-50" />
            {item.payer} 先付
          </span>
          <span>•</span>
          <span>{item.date}</span>
        </div>

        {/* ▼▼▼ 新增：顯示分帳成員的代表色點點 ▼▼▼ */}
        <div className="flex items-center mt-2 space-x-1">
          {involvedMembers.map((member) => (
            <div 
              key={member}
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: memberColors[member] || '#E5E7EB' }} // 如果沒設定顏色就顯示灰色
              title={member}
            />
          ))}
          {involvedMembers.length > 1 && (
             <span className="text-[10px] text-gray-400 ml-1">分攤</span>
          )}
        </div>
        {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
      </div>

      <div className="text-right">
        <div className="font-black text-[#5E5340] text-xl font-mono">
          {item.currency === 'JPY' ? `¥${item.amount.toLocaleString()}` : `$${item.amount.toLocaleString()}`}
        </div>
        {item.currency === 'JPY' && (
          <div className="text-xs text-gray-400 font-bold">
            ≈ NT$ {amountTWD.toLocaleString()}
          </div>
        )}
      </div>

      {/* 操作按鈕 (懸停顯示) */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-2 text-gray-300 hover:text-blue-400">
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-400">
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </div>
  );
};