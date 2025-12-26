import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBed, faTicket, faCopy, faLink, faTrashCan, faPen, faSuitcaseRolling } from '@fortawesome/free-solid-svg-icons'; // 修正：移除了沒用到的圖示

// 定義資料格式
export interface BookingItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;       
  provider: string;    
  date: string;        
  time: string;        
  reference?: string;  
  price?: string;      
  link?: string;       
  
  departCode?: string;
  departName?: string;
  arriveCode?: string;
  arriveName?: string;
  baggage?: string;   
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`已複製：${text}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[4px_4px_0px_0px_#E0E5D5] border-2 border-transparent hover:border-orange-200 transition-all overflow-hidden mb-4 relative group">
      {/* 頂部彩色條 */}
      <div className={`h-2 ${config.color}`} />
      
      <div className="p-4">
        {/* 標題區 */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center text-${config.color.split('-')[1]}-500`}>
              <FontAwesomeIcon icon={config.icon} className="text-sm" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{config.label}</span>
              <h3 className="text-lg font-bold text-gray-700 leading-tight">
                {item.type === 'flight' ? item.provider : item.title}
              </h3>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => onEdit(item)} className="p-2 text-gray-300 hover:text-blue-400"><FontAwesomeIcon icon={faPen} /></button>
             <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-400"><FontAwesomeIcon icon={faTrashCan} /></button>
          </div>
        </div>

        {/* 機票專屬：飛行路徑視覺化 */}
        {item.type === 'flight' && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-center w-16">
                <div className="text-2xl font-black text-blue-600 font-mono">{item.departCode || 'DEP'}</div>
                <div className="text-[10px] font-bold text-gray-500 truncate">{item.departName || '出發地'}</div>
                <div className="text-xs font-bold text-blue-400 mt-1">{item.time}</div>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <div className="text-[10px] text-gray-400 font-bold mb-1">{item.date}</div>
                <div className="w-full h-px bg-blue-200 relative flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlane} className="text-blue-400 bg-blue-50 px-1 transform rotate-90" />
                </div>
                <div className="text-[10px] text-gray-400 font-bold mt-1">{item.title}</div>
              </div>

              <div className="text-center w-16">
                <div className="text-2xl font-black text-blue-600 font-mono">{item.arriveCode || 'ARR'}</div>
                <div className="text-[10px] font-bold text-gray-500 truncate">{item.arriveName || '抵達地'}</div>
              </div>
            </div>

            {item.baggage && (
              <div className="flex justify-center mt-2 border-t border-blue-100 pt-2">
                <div className="flex items-center space-x-1 text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                  <FontAwesomeIcon icon={faSuitcaseRolling} className="text-orange-400" />
                  <span>託運限重:</span>
                  <span className="text-gray-800">{item.baggage}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 一般資訊區 */}
        {item.type !== 'flight' && (
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
        )}

        {/* 底部連結 */}
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