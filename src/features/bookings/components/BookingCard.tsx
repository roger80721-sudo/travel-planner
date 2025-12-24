import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBed, faTicket, faCopy, faLink, faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';

// 定義資料格式
export interface BookingItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;       // 例如：星宇航空 JX800
  provider: string;    // 例如：Starlux
  date: string;        // 日期
  time: string;        // 時間
  reference?: string;  // 訂位代號
  price?: string;      // 價格
  link?: string;       // 訂單連結/電子機票網址
  notes?: string;
}

const TYPE_CONFIG = {
  flight:   { icon: faPlane,  label: '機票', color: 'bg-blue-500',  bg: 'bg-blue-50' },
  hotel:    { icon: faBed,    label: '住宿', color: 'bg-emerald-500', bg: 'bg-emerald-50' },
  activity: { icon: faTicket, label: '票券', color: 'bg-orange-500', bg: 'bg-orange-50' },
};

interface BookingCardProps {
  item: BookingItem;
  onEdit: (item: BookingItem) => void;
  onDelete: (id: string) => void;
}

export const BookingCard = ({ item, onEdit, onDelete }: BookingCardProps) => {
  const config = TYPE_CONFIG[item.type];

  // 複製訂位代號的功能
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`已複製：${text}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[4px_4px_0px_0px_#E0E5D5] border-2 border-transparent hover:border-orange-200 transition-all overflow-hidden mb-4">
      {/* 頂部彩色條 */}
      <div className={`h-2 ${config.color}`} />
      
      <div className="p-4">
        {/* 標題區 */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center text-${config.color.split('-')[1]}-500`}>
              <FontAwesomeIcon icon={config.icon} className="text-sm" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{config.label}</span>
              <h3 className="text-lg font-bold text-gray-700 leading-tight">{item.title}</h3>
            </div>
          </div>
          {/* 操作按鈕 */}
          <div className="flex space-x-1">
             <button onClick={() => onEdit(item)} className="p-2 text-gray-300 hover:text-blue-400"><FontAwesomeIcon icon={faPen} /></button>
             <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-400"><FontAwesomeIcon icon={faTrashCan} /></button>
          </div>
        </div>

        {/* 資訊區 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-[10px] text-gray-400 block">日期時間</span>
            <span className="text-sm font-bold text-gray-600">{item.date} {item.time}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-[10px] text-gray-400 block">供應商/地點</span>
            <span className="text-sm font-bold text-gray-600 truncate">{item.provider}</span>
          </div>
        </div>

        {/* 關鍵資訊：訂位代號 & 連結 */}
        <div className="flex space-x-2">
          {item.reference && (
            <div 
              onClick={() => handleCopy(item.reference!)}
              className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <span className="text-[10px] text-orange-400 font-bold mb-1">訂位代號 (點擊複製)</span>
              <div className="flex items-center space-x-2 text-orange-600 font-mono font-black text-lg">
                <span>{item.reference}</span>
                <FontAwesomeIcon icon={faCopy} className="text-xs opacity-50" />
              </div>
            </div>
          )}
          
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noreferrer"
              className="w-16 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
            >
              <FontAwesomeIcon icon={faLink} className="text-xl mb-1" />
              <span className="text-[10px] font-bold">開啟</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};