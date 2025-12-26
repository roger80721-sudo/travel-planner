import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, faTrainSubway, faBagShopping, faTicket, faEllipsis, 
  faPen, faTrashCan, faLocationDot, faMoneyBill, faCreditCard, faMobileScreen, faIdCard, faUserGroup 
} from '@fortawesome/free-solid-svg-icons';

// ★★★ 這裡一定要有 export 喔！ ★★★
export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  payer?: string;
  involved?: string[];
  method?: 'cash' | 'card' | 'suica' | 'mobile';
  location?: string;
  photoUrl?: string;
}

const CATEGORIES: Record<string, any> = {
  food: { icon: faUtensils, bg: 'bg-orange-100', text: 'text-orange-500' },
  transport: { icon: faTrainSubway, bg: 'bg-blue-100', text: 'text-blue-500' },
  shopping: { icon: faBagShopping, bg: 'bg-pink-100', text: 'text-pink-500' },
  entertainment: { icon: faTicket, bg: 'bg-purple-100', text: 'text-purple-500' },
  other: { icon: faEllipsis, bg: 'bg-gray-100', text: 'text-gray-500' },
};

const METHODS: Record<string, any> = {
  cash: { icon: faMoneyBill, label: '現金' },
  card: { icon: faCreditCard, label: '信用卡' },
  suica: { icon: faIdCard, label: 'IC卡' },
  mobile: { icon: faMobileScreen, label: 'Pay' },
};

interface ExpenseCardProps {
  item: ExpenseItem;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

// ★★★ 這裡也要有 export ★★★
export const ExpenseCard = ({ item, onEdit, onDelete }: ExpenseCardProps) => {
  const cat = CATEGORIES[item.category] || CATEGORIES.other;
  const payMethod = METHODS[item.method || 'cash'];
  const involvedCount = item.involved?.length || 0;
  const involvedText = involvedCount > 0 ? `${involvedCount} 人分攤` : '全員分攤';

  return (
    <div className="bg-white rounded-2xl shadow-[4px_4px_0px_0px_#E0E5D5] border-2 border-transparent hover:border-orange-200 transition-all overflow-hidden relative group">
      {item.photoUrl && (
        <div className="h-32 w-full relative overflow-hidden">
          <img 
            src={item.photoUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-3 text-white text-xs font-bold flex items-center">
            {item.location && <><FontAwesomeIcon icon={faLocationDot} className="mr-1" /> {item.location}</>}
          </div>
        </div>
      )}

      <div className="p-4 flex items-center">
        {!item.photoUrl && (
          <div className={`w-12 h-12 rounded-full ${cat.bg} ${cat.text} flex items-center justify-center text-lg mr-4 flex-shrink-0`}>
            <FontAwesomeIcon icon={cat.icon} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-700 truncate">{item.title}</h3>
            <span className="font-black text-lg text-gray-800 font-mono">
              ¥ {Number(item.amount).toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-gray-400">
             <span>{item.date}</span>
             <span className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center text-gray-500">
               {item.payer || '我'}
               <span className="mx-1">•</span>
               <FontAwesomeIcon icon={payMethod.icon} className="mr-1" />
               {payMethod.label}
             </span>
             <span className="flex items-center text-orange-400">
               <FontAwesomeIcon icon={faUserGroup} className="mr-1" />
               {involvedText}
             </span>
          </div>
        </div>

        <div className="absolute right-2 bottom-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg p-1">
          <button onClick={() => onEdit(item)} className="p-2 text-gray-300 hover:text-blue-400">
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-400">
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>
      </div>
    </div>
  );
};