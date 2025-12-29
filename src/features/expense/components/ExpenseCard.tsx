import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ▼▼▼ 修正：移除了沒用到的 faPen ▼▼▼
import { 
  faTrashCan, faUser, 
  faUtensils, faTrainSubway, faBagShopping, faBed, faCamera, faEllipsis 
} from '@fortawesome/free-solid-svg-icons';

export interface ExpenseItem {
  id: string;
  item: string;
  amount: number;
  currency: 'TWD' | 'JPY';
  payer: string;
  involved: string[];
  date: string;
  category?: string;
}

interface ExpenseCardProps {
  item: ExpenseItem;
  exchangeRate: number;
  memberColors: Record<string, string>;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

const CAT_CONFIG: Record<string, { icon: any, bg: string, text: string }> = {
  food: { icon: faUtensils, bg: 'bg-orange-100', text: 'text-orange-500' },
  traffic: { icon: faTrainSubway, bg: 'bg-blue-100', text: 'text-blue-500' },
  shopping: { icon: faBagShopping, bg: 'bg-pink-100', text: 'text-pink-500' },
  hotel: { icon: faBed, bg: 'bg-indigo-100', text: 'text-indigo-500' },
  activity: { icon: faCamera, bg: 'bg-green-100', text: 'text-green-500' },
  other: { icon: faEllipsis, bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const ExpenseCard = ({ item, exchangeRate, memberColors, onEdit, onDelete }: ExpenseCardProps) => {
  const amountTWD = item.currency === 'JPY' ? Math.round(item.amount * exchangeRate) : item.amount;
  const involvedMembers = item.involved && item.involved.length > 0 ? item.involved : [item.payer];
  
  const cat = CAT_CONFIG[item.category || 'other'] || CAT_CONFIG.other;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] flex items-center group relative cursor-pointer active:scale-[0.98] transition-transform" onClick={() => onEdit(item)}>
      
      <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.text} flex items-center justify-center text-xl mr-4 flex-shrink-0`}>
        <FontAwesomeIcon icon={cat.icon} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-black text-[#5E5340] text-lg truncate">{item.item}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-1 opacity-50" />
            {item.payer} 先付
          </span>
          <span className="opacity-30">|</span>
          <span className={`font-bold px-1.5 rounded-md ${item.currency === 'JPY' ? 'bg-blue-50 text-blue-400' : 'bg-green-50 text-green-500'}`}>
            {item.currency}
          </span>
        </div>

        <div className="flex items-center mt-2 space-x-1">
          {involvedMembers.map((member) => (
            <div 
              key={member}
              className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: memberColors[member] || '#E5E7EB' }}
              title={member}
            />
          ))}
        </div>
      </div>

      <div className="text-right flex-shrink-0 pl-2">
        <div className="font-black text-[#5E5340] text-xl font-mono">
          {item.currency === 'JPY' ? `¥${item.amount.toLocaleString()}` : `$${item.amount.toLocaleString()}`}
        </div>
        {item.currency === 'JPY' && (
          <div className="text-[10px] text-gray-400 font-bold mt-0.5">
            ≈ ${amountTWD.toLocaleString()}
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
          className="p-2 text-gray-300 hover:text-red-400"
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </div>
  );
};