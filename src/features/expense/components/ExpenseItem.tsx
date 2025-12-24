import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBagShopping, faTrain, faTicket, faEllipsis } from '@fortawesome/free-solid-svg-icons';

// 更新介面：加入幣別和原價
export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number; // 這是換算後的台幣金額 (用於統計)
  originalAmount?: number; // 這是日幣原價
  currency: 'TWD' | 'JPY'; // 幣別
  category: 'food' | 'shopping' | 'transport' | 'ticket' | 'other';
  date: string;
}

const CATEGORY_CONFIG = {
  food:      { icon: faUtensils,    label: '餐飲', color: 'bg-red-100 text-red-500' },
  shopping:  { icon: faBagShopping, label: '購物', color: 'bg-yellow-100 text-yellow-600' },
  transport: { icon: faTrain,       label: '交通', color: 'bg-blue-100 text-blue-500' },
  ticket:    { icon: faTicket,      label: '門票', color: 'bg-purple-100 text-purple-500' },
  other:     { icon: faEllipsis,    label: '其他', color: 'bg-gray-100 text-gray-500' },
};

interface ExpenseItemProps {
  item: ExpenseRecord;
  onLongPress: (id: string) => void;
}

export const ExpenseItem = ({ item, onLongPress }: ExpenseItemProps) => {
  const config = CATEGORY_CONFIG[item.category];

  return (
    <div className="flex items-center bg-white p-4 rounded-2xl mb-3 shadow-[2px_2px_0px_0px_#E0E5D5] border border-transparent hover:border-orange-200 transition-all">
      {/* 圖示 */}
      <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center text-xl mr-4`}>
        <FontAwesomeIcon icon={config.icon} />
      </div>

      {/* 資訊 */}
      <div className="flex-1">
        <h4 className="font-bold text-gray-700">{item.title}</h4>
        <span className="text-xs text-gray-400 font-bold">{item.date} • {config.label}</span>
      </div>

      {/* 金額區塊 */}
      <div className="text-right flex flex-col items-end">
        {/* 主要顯示台幣 */}
        <span className="block font-black text-lg text-[#5C4033] font-mono leading-none">
          NT${item.amount.toLocaleString()}
        </span>
        
        {/* 如果是日幣，在下方顯示原價 */}
        {item.currency === 'JPY' && item.originalAmount && (
          <span className="text-xs font-bold text-gray-400 mt-1 bg-gray-100 px-1.5 py-0.5 rounded">
            ¥{item.originalAmount.toLocaleString()}
          </span>
        )}

        <button 
          onClick={() => onLongPress(item.id)}
          className="text-[10px] text-red-300 hover:text-red-500 mt-1"
        >
          刪除
        </button>
      </div>
    </div>
  );
};