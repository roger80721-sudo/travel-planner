import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashCan, faPen, faPlane, faHotel, faTicket, faSuitcaseRolling, faArrowRight 
} from '@fortawesome/free-solid-svg-icons';

export interface BookingItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  provider?: string;
  date: string;
  time?: string;
  reference?: string;
  link?: string;
  // 機票專屬
  departCode?: string;
  departName?: string;
  arriveCode?: string;
  arriveName?: string;
  baggage?: string;
  // 住宿專屬
  checkOutDate?: string;
  address?: string;
}

interface BookingCardProps {
  item: BookingItem;
  onEdit: (item: BookingItem) => void;
  onDelete: (id: string) => void;
}

export const BookingCard = ({ item, onEdit, onDelete }: BookingCardProps) => {
  
  // ✈️ 機票卡片特別設計
  if (item.type === 'flight') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#F2F4E7] overflow-hidden group relative">
        {/* 頂部航空公司條 */}
        <div className="bg-[#5C4033] px-4 py-2 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faPlane} className="text-xs opacity-70" />
            <span className="font-bold text-sm">{item.provider}</span>
            <span className="font-mono text-xs opacity-70">{item.title}</span>
          </div>
          {item.reference && (
            <div className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-orange-100">
              Ref: {item.reference}
            </div>
          )}
        </div>

        {/* 登機證內容 */}
        <div className="p-4 flex items-center justify-between">
          {/* 出發地 */}
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-[#5E5340]">{item.departCode}</div>
            <div className="text-[10px] text-gray-400 font-bold">{item.departName}</div>
            <div className="text-sm font-bold text-[#5C4033] mt-1">{item.time}</div>
          </div>

          {/* 中間飛機圖示與日期 */}
          <div className="flex flex-col items-center justify-center px-2 flex-[1.5]">
            <div className="text-[10px] font-bold text-gray-400 mb-1 font-mono">{item.date}</div>
            <div className="flex items-center w-full space-x-2">
              <div className="h-[2px] bg-gray-200 flex-1 relative">
                <div className="absolute right-0 -top-1 w-1 h-1 rounded-full bg-gray-300"></div>
              </div>
              <FontAwesomeIcon icon={faPlane} className="text-[#3AA986] text-lg transform rotate-45" />
              <div className="h-[2px] bg-gray-200 flex-1 relative">
                <div className="absolute left-0 -top-1 w-1 h-1 rounded-full bg-gray-300"></div>
              </div>
            </div>
            {item.baggage && (
              <div className="mt-1 flex items-center text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                <FontAwesomeIcon icon={faSuitcaseRolling} className="mr-1" />
                {item.baggage}
              </div>
            )}
          </div>

          {/* 目的地 */}
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-[#5E5340]">{item.arriveCode}</div>
            <div className="text-[10px] text-gray-400 font-bold">{item.arriveName}</div>
            <div className="text-sm font-bold text-[#5C4033] mt-1">--:--</div> {/* 抵達時間通常不確定，留空或顯示 duration */}
          </div>
        </div>

        {/* 編輯/刪除按鈕 (浮動) */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-1.5 bg-white/90 rounded-full text-blue-400 shadow-sm hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faPen} className="text-xs" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 bg-white/90 rounded-full text-red-400 shadow-sm hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          </button>
        </div>
      </div>
    );
  }

  // 🏨 住宿/活動卡片 (維持簡潔風格)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] flex justify-between items-start group relative">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${item.type === 'hotel' ? 'bg-indigo-400' : 'bg-green-500'}`}>
            <FontAwesomeIcon icon={item.type === 'hotel' ? faHotel : faTicket} className="mr-1" />
            {item.type === 'hotel' ? '住宿' : '票券'}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">{item.provider}</span>
        </div>
        
        <h3 className="font-black text-[#5E5340] text-lg mb-1">{item.title}</h3>
        
        <div className="text-xs font-bold text-gray-500 flex items-center flex-wrap gap-2">
          <span className="bg-gray-50 px-2 py-1 rounded">{item.date} {item.time}</span>
          {item.checkOutDate && (
            <>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-gray-300" />
              <span className="bg-gray-50 px-2 py-1 rounded">{item.checkOutDate}</span>
            </>
          )}
        </div>
        
        {item.reference && (
          <div className="mt-2 text-xs font-mono text-gray-400">
            單號：<span className="select-all bg-yellow-50 px-1 rounded border border-yellow-100 text-yellow-700">{item.reference}</span>
          </div>
        )}
      </div>

      {item.link && (
        <a 
          href={item.link} 
          target="_blank" 
          rel="noreferrer"
          className="ml-3 px-3 py-2 bg-[#F2F4E7] text-[#5C4033] rounded-xl text-xs font-bold hover:bg-[#E8EAE0] transition-colors"
        >
          查看
        </a>
      )}

      {/* 編輯/刪除按鈕 */}
      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-1.5 bg-white rounded-full text-blue-400 shadow-sm border border-gray-100 hover:scale-110">
          <FontAwesomeIcon icon={faPen} className="text-xs" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 bg-white rounded-full text-red-400 shadow-sm border border-gray-100 hover:scale-110">
          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
        </button>
      </div>
    </div>
  );
};